/**
 * @module services/reportService
 * @description Domain business logic for Daily Supervisory Reports.
 * Implements atomic Mongoose ClientSession transactions, plain-text synthesis,
 * 1-to-1 Chat pairing, and paginated report queries.
 * Conforms to Master Technical Specification Sections 1.4.7, 4.2.3, and 11.4.21–25.
 */
import mongoose from 'mongoose';
import { Report } from '../models/Report.js';
import { Chat } from '../models/Chat.js';
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';
import { renderReportText } from './reportFormatter.js';
import { parseEthiopianDateString, ethiopianToGregorian } from '../utils/ethiopianDate.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

/**
 * Creates a new Daily Supervisory Report with atomic 1-to-1 Chat instantiation.
 *
 * @param {string} userId - ID of authenticated supervisor.
 * @param {object} data - Report form payload.
 * @returns {Promise<{ report: object, chat: object }>} Created report and linked chat.
 */
export const createReport = async (userId, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch user for supervisor snapshot
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new NotFoundError('Supervisor account not found');
    }
    const supervisorName = user.fullName || `${user.firstName} ${user.lastName}`.trim();

    // 2. Fetch primary branch for snapshot
    const primaryBranch = await Branch.findOne({ _id: data.branch, user: userId }).session(session);
    if (!primaryBranch) {
      throw new NotFoundError('Primary branch location not found');
    }

    // 3. Process and snapshot visited branches itinerary (if multi-branch)
    const visits = [];
    if (Array.isArray(data.visits) && data.visits.length > 0) {
      for (const v of data.visits) {
        if (!v.branch) continue;
        const visitedBranch = await Branch.findOne({ _id: v.branch, user: userId }).session(session);
        if (!visitedBranch) {
          throw new NotFoundError(`Visited branch ${v.branch} not found`);
        }
        visits.push({
          branch: visitedBranch._id,
          branchName: visitedBranch.name,
          clockIn: v.clockIn,
          clockOut: v.clockOut,
        });
      }
    }

    // 4. Normalize date to UTC midnight (supports DD-MM-YY Ethiopian date or ISO string)
    let utcDate;
    if (typeof data.date === 'string' && /^\d{1,2}-\d{1,2}-\d{2,4}$/.test(data.date.trim())) {
      const parsedEth = parseEthiopianDateString(data.date);
      if (parsedEth) {
        utcDate = ethiopianToGregorian(parsedEth.year, parsedEth.month, parsedEth.day);
      }
    }
    if (!utcDate) {
      const inputDate = new Date(data.date);
      utcDate = new Date(
        Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate(), 0, 0, 0, 0)
      );
    }

    // Format activities and issues arrays
    const activities = Array.isArray(data.activities)
      ? data.activities.map((a) => (typeof a === 'string' ? { text: a, status: 'completed' } : a))
      : [];

    const issues = Array.isArray(data.issues)
      ? data.issues.map((i) => (typeof i === 'string' ? { text: i, status: 'reported' } : i))
      : [];

    const comments = Array.isArray(data.comments)
      ? data.comments
      : typeof data.comments === 'string' && data.comments.trim()
      ? [data.comments.trim()]
      : [];

    // 5. Deterministically compile locked plain-text Amharic report
    const generatedText = renderReportText({
      date: utcDate,
      branchName: primaryBranch.name,
      supervisorName,
      clockIn: data.clockIn,
      clockOut: data.clockOut,
      visits,
      activities,
      issues,
      comments,
    });

    // 6. Instantiate Report within atomic session using array syntax
    const isMulti = visits.length > 0;
    const [report] = await Report.create(
      [
        {
          user: userId,
          type: isMulti ? 'multi' : 'single',
          branch: primaryBranch._id,
          branchName: primaryBranch.name,
          supervisorName,
          date: utcDate,
          clockIn: data.clockIn,
          clockOut: data.clockOut,
          visits,
          activities,
          issues,
          comments,
          generated: generatedText,
        },
      ],
      { session }
    );

    // 7. Instantiate paired 1-to-1 Chat within atomic session
    const chatTitle = isMulti
      ? `Report: ${primaryBranch.name} (+${visits.length - 1} branches)`
      : `Report: ${primaryBranch.name}`;

    const [chat] = await Chat.create(
      [
        {
          user: userId,
          type: 'report',
          report: report._id,
          title: chatTitle,
        },
      ],
      { session }
    );

    // Link chat to report
    report.chat = chat._id;
    await report.save({ session });

    await session.commitTransaction();

    return {
      report: report.toObject(),
      chat: chat.toObject(),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Retrieves a single report by ID.
 *
 * @param {string} userId - ID of authenticated supervisor.
 * @param {string} reportId - ID of report.
 * @returns {Promise<object>} Populated report document.
 */
export const getReportById = async (userId, reportId) => {
  const report = await Report.findOne({ _id: reportId, user: userId })
    .populate('branch', 'name address phone')
    .populate('visits.branch', 'name address phone')
    .populate('chat', 'title type');

  if (!report) {
    throw new NotFoundError('Report not found');
  }

  return report.toObject();
};

/**
 * Lists reports with pagination, sorting, and filters.
 *
 * @param {string} userId - ID of authenticated supervisor.
 * @param {object} [options={}] - Filter and pagination query parameters.
 * @returns {Promise<object>} Paginated envelope with docs, totalDocs, totalPages, etc.
 */
export const listReports = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    branch,
    type,
    isArchived = false,
    startDate,
    endDate,
    sort = '-date',
  } = options;

  const query = {
    user: userId,
    isArchived: Boolean(isArchived),
  };

  if (branch) query.branch = branch;
  if (type) query.type = type;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const paginationOptions = {
    page,
    limit,
    sort,
    populate: [
      { path: 'branch', select: 'name address phone' },
      { path: 'visits.branch', select: 'name address phone' },
    ],
  };

  return Report.paginate(query, paginationOptions);
};

/**
 * Updates an existing report and re-compiles its plain-text representation.
 *
 * @param {string} userId - ID of authenticated supervisor.
 * @param {string} reportId - ID of report to update.
 * @param {object} updates - Fields to mutate.
 * @returns {Promise<object>} Updated report document.
 */
export const updateReport = async (userId, reportId, updates) => {
  const report = await Report.findOne({ _id: reportId, user: userId });
  if (!report) {
    throw new NotFoundError('Report not found');
  }

  if (updates.clockIn) report.clockIn = updates.clockIn;
  if (updates.clockOut) report.clockOut = updates.clockOut;
  if (updates.activities) report.activities = updates.activities;
  if (updates.issues) report.issues = updates.issues;
  if (updates.comments) report.comments = updates.comments;
  if (updates.visits) report.visits = updates.visits;

  // Re-compile plain-text Amharic report
  report.generated = renderReportText({
    date: report.date,
    branchName: report.branchName,
    supervisorName: report.supervisorName,
    clockIn: report.clockIn,
    clockOut: report.clockOut,
    visits: report.visits,
    activities: report.activities,
    issues: report.issues,
    comments: report.comments,
  });

  await report.save();
  return report.toObject();
};
