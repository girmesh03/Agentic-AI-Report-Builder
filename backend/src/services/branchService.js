/**
 * @module services/branchService
 * @description Business logic, duplicate prevention, soft-archive lifecycle,
 * and paginated queries for company branch locations.
 */
import { Branch } from '../models/Branch.js';
import { ConflictError, NotFoundError } from '../errors/index.js';
import { BRANCH_CONFIG } from '../utils/constants.js';

/**
 * Escapes special regex characters in a query string.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Creates a new company branch for the supervisor.
 * Enforces per-user unique normalizedName constraint.
 *
 * @async
 * @function createBranch
 * @param {string} userId - Supervisor ObjectId.
 * @param {object} branchData - Branch creation payload { name, phone, address }.
 * @returns {Promise<object>} Created branch DTO.
 */
export const createBranch = async (userId, { name, phone, address }) => {
  const trimmedName = name.trim();
  const normalizedName = trimmedName.toLowerCase();

  // 1. Check for collision under same supervisor account
  const existing = await Branch.findOne({ user: userId, normalizedName });
  if (existing) {
    throw new ConflictError('A branch with this name already exists for this supervisor');
  }

  // 2. Instantiate and persist new branch
  const branch = await Branch.create({
    user: userId,
    name: trimmedName,
    normalizedName,
    phone: phone ? phone.trim() : null,
    address: address ? address.trim() : null,
    isArchived: false,
    archivedAt: null,
  });

  return branch.toObject();
};

/**
 * Retrieves paginated branches for supervisor with active/archived filters and search.
 *
 * @async
 * @function getBranches
 * @param {string} userId - Supervisor ObjectId.
 * @param {object} options - Query options { page, limit, search, isArchived, sort }.
 * @returns {Promise<object>} Paginated envelope with docs and pagination metadata.
 */
export const getBranches = async (
  userId,
  {
    page = BRANCH_CONFIG.DEFAULT_PAGE,
    limit = BRANCH_CONFIG.DEFAULT_LIMIT,
    search,
    isArchived = false,
    sort = '-createdAt',
  } = {}
) => {
  const query = { user: userId };

  // Explicit boolean filtering (defaults to false for active branches)
  query.isArchived = Boolean(isArchived);

  // Search filter across name, address, and phone
  if (search && typeof search === 'string' && search.trim()) {
    const escaped = escapeRegex(search.trim());
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { address: { $regex: escaped, $options: 'i' } },
      { phone: { $regex: escaped, $options: 'i' } },
    ];
  }

  const paginationOptions = {
    page: Math.max(1, parseInt(page, 10) || 1),
    limit: Math.min(BRANCH_CONFIG.MAX_LIMIT, Math.max(1, parseInt(limit, 10) || 10)),
    sort: sort || '-createdAt',
    customLabels: {
      docs: 'docs',
      totalDocs: 'totalDocs',
    },
  };

  const result = await Branch.paginate(query, paginationOptions);

  return {
    docs: result.docs.map((doc) => doc.toObject()),
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
  };
};

/**
 * Retrieves a single branch by ID with computed statistics.
 *
 * @async
 * @function getBranchById
 * @param {string} userId - Supervisor ObjectId.
 * @param {string} branchId - Branch ObjectId.
 * @returns {Promise<object>} Branch DTO with computed statistics.
 */
export const getBranchById = async (userId, branchId) => {
  const branch = await Branch.findOne({ _id: branchId, user: userId });
  if (!branch) {
    throw new NotFoundError('Branch not found');
  }

  // Aggregate stats (can be extended with Report collection integration)
  const branchObj = branch.toObject();
  return {
    ...branchObj,
    totalReports: 0,
    openIssues: 0,
    lastVisitedAt: null,
  };
};

/**
 * Updates an existing branch's fields with collision prevention.
 *
 * @async
 * @function updateBranch
 * @param {string} userId - Supervisor ObjectId.
 * @param {string} branchId - Branch ObjectId.
 * @param {object} updates - Update payload { name, phone, address }.
 * @returns {Promise<object>} Updated branch DTO.
 */
export const updateBranch = async (userId, branchId, { name, phone, address }) => {
  const branch = await Branch.findOne({ _id: branchId, user: userId });
  if (!branch) {
    throw new NotFoundError('Branch not found');
  }

  if (name !== undefined) {
    const trimmedName = name.trim();
    const normalizedName = trimmedName.toLowerCase();

    // Check collision against other branches under same supervisor
    const collision = await Branch.findOne({
      user: userId,
      normalizedName,
      _id: { $ne: branchId },
    });
    if (collision) {
      throw new ConflictError('A branch with this name already exists for this supervisor');
    }

    branch.name = trimmedName;
    branch.normalizedName = normalizedName;
  }

  if (phone !== undefined) {
    branch.phone = phone && phone.trim() ? phone.trim() : null;
  }

  if (address !== undefined) {
    branch.address = address && address.trim() ? address.trim() : null;
  }

  await branch.save();
  return branch.toObject();
};

/**
 * Soft-archives a branch. Hard deletion is strictly forbidden via API.
 * Archived branches are purged automatically after 30 days by sweeper task.
 *
 * @async
 * @function archiveBranch
 * @param {string} userId - Supervisor ObjectId.
 * @param {string} branchId - Branch ObjectId.
 * @returns {Promise<void>}
 */
export const archiveBranch = async (userId, branchId) => {
  const branch = await Branch.findOne({ _id: branchId, user: userId });
  if (!branch) {
    throw new NotFoundError('Branch not found');
  }

  branch.isArchived = true;
  branch.archivedAt = new Date();
  await branch.save();
};

/**
 * Restores a soft-archived branch back to active status.
 *
 * @async
 * @function restoreBranch
 * @param {string} userId - Supervisor ObjectId.
 * @param {string} branchId - Branch ObjectId.
 * @returns {Promise<object>} Restored branch DTO.
 */
export const restoreBranch = async (userId, branchId) => {
  const branch = await Branch.findOne({ _id: branchId, user: userId });
  if (!branch) {
    throw new NotFoundError('Branch not found');
  }

  branch.isArchived = false;
  branch.archivedAt = null;
  await branch.save();

  return branch.toObject();
};
