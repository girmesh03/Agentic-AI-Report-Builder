/**
 * @module controllers/branchController
 * @description HTTP controllers for company branch CRUD, filters, soft-archive, and restoration.
 */
import asyncHandler from 'express-async-handler';
import * as branchService from '../services/branchService.js';
import { HTTP_STATUS } from '../config/httpStatus.js';

/**
 * Creates a new company branch for the authenticated supervisor.
 * @function createBranchHandler
 */
export const createBranchHandler = asyncHandler(async (req, res) => {
  const branch = await branchService.createBranch(req.user._id, req.validated.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Branch created successfully',
    data: branch,
  });
});

/**
 * Retrieves paginated branches for the authenticated supervisor.
 * @function getBranchesHandler
 */
export const getBranchesHandler = asyncHandler(async (req, res) => {
  const result = await branchService.getBranches(req.user._id, req.validated.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Branches retrieved successfully',
    data: result,
  });
});

/**
 * Retrieves detailed branch info and computed statistics.
 * @function getBranchDetailsHandler
 */
export const getBranchDetailsHandler = asyncHandler(async (req, res) => {
  const branch = await branchService.getBranchById(req.user._id, req.validated.params.branchId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Branch details retrieved successfully',
    data: branch,
  });
});

/**
 * Updates an existing branch.
 * @function updateBranchHandler
 */
export const updateBranchHandler = asyncHandler(async (req, res) => {
  const branch = await branchService.updateBranch(
    req.user._id,
    req.validated.params.branchId,
    req.validated.body
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Branch updated successfully',
    data: branch,
  });
});

/**
 * Soft-archives a branch.
 * @function archiveBranchHandler
 */
export const archiveBranchHandler = asyncHandler(async (req, res) => {
  await branchService.archiveBranch(req.user._id, req.validated.params.branchId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Branch archived successfully',
    data: null,
  });
});

/**
 * Restores a soft-archived branch.
 * @function restoreBranchHandler
 */
export const restoreBranchHandler = asyncHandler(async (req, res) => {
  const branch = await branchService.restoreBranch(req.user._id, req.validated.params.branchId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Branch restored successfully',
    data: branch,
  });
});
