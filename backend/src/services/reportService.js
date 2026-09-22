/**
 * @module services/reportService
 * @description Domain business logic for Daily Supervisory Reports.
 * Implements atomic Mongoose ClientSession transactions, plain-text synthesis,
 * 1-to-1 Chat pairing, and paginated report queries.
 * Conforms to Master Technical Specification Sections 1.4.7, 4.2.3, and 11.4.21–25.
 */
import path from 'node:path';
import fs from 'node:fs';
import mongoose from 'mongoose';
import { Report } from '../models/Report.js';
import { Chat } from '../models/Chat.js';
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';
import { renderReportText } from './reportFormatter.js';
import { parseEthiopianDateString, ethiopianToGregorian } from '../utils/ethiopianDate.js';
import { probeAudioMetadata } from './audioService.js';
import { transcribeAudioSequence } from './sttService.js';
import { logger } from '../config/logger.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

/**
 * Creates a new Daily Supervisory Report with atomic 1-to-1 Chat instantiation.
 *
 * @param {string} userId - ID of authenticated supervisor.
 * @param {object} data - Report form payload.
 * @param {Array<object>} [files=[]] - Uploaded audio files array.
 * @returns {Promise<{ report: object, chat: object }>} Created report and linked chat.
 */
export const createReport = async (userId, data, files = []) => {
  // 1. Fetch user for supervisor snapshot
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('Supervisor account not found');
  }
  const supervisorName = user.fullName || `${user.firstName} ${user.lastName}`.trim();

  // 2. Fetch primary branch for snapshot
  const primaryBranch = await Branch.findOne({ _id: data.branch, user: userId });
  if (!primaryBranch) {
    throw new NotFoundError('Primary branch location not found');
  }

  // 3. Process and snapshot visited branches itinerary (if multi-branch)
  const visits = [];
  if (Array.isArray(data.visits) && data.visits.length > 0) {
    for (const v of data.visits) {
      if (!v.branch) continue;
      const visitedBranch = await Branch.findOne({ _id: v.branch, user: userId });
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

  // 6. Process audio recordings if present (probed & transcribed BEFORE DB transaction)
  const audioFiles = [];
  let transcription = '';
  if (Array.isArray(files) && files.length > 0) {
    const tempDir = path.resolve(process.cwd(), 'uploads/temp');
    for (const file of files) {
      let duration = 0;
      try {
        const meta = await probeAudioMetadata(file.path);
        duration = meta.duration || 0;
      } catch (err) {
        logger.warn(`Failed to probe duration for ${file.originalname}: ${err.message}`);
      }
      audioFiles.push({
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        duration,
      });
    }

    try {
      const result = await transcribeAudioSequence(files, tempDir);
      transcription = result.fullTranscript || '';
    } catch (err) {
      logger.error(`[reportService] Audio transcription warning: ${err.message}`);
    }
  }

  // 7. Atomic DB Transaction for Report and paired Chat creation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
          transcription,
          audioFiles,
        },
      ],
      { session }
    );

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

/**
 * Retrieves audio clip binary information for authenticated supervisor (Method 1).
 *
 * @param {string} userId - ID of supervisor.
 * @param {string} reportId - ID of report.
 * @param {string} clipId - ID of audio subdocument.
 * @returns {Promise<{ clip: object, filePath: string }>} Audio subdocument and resolved file path.
 */
export const getReportAudioClip = async (userId, reportId, clipId) => {
  const report = await Report.findOne({ _id: reportId, user: userId });
  if (!report) {
    throw new NotFoundError('Report not found');
  }

  const clip = report.audioFiles.id(clipId);
  if (!clip) {
    throw new NotFoundError('Audio clip not found');
  }

  const resolvedPath = path.resolve(clip.path);
  if (!fs.existsSync(resolvedPath)) {
    throw new NotFoundError('Audio file does not exist on disk');
  }

  return { clip: clip.toObject(), filePath: resolvedPath };
};
