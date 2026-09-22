/**
 * @module controllers/reportController
 * @description HTTP controllers for Daily Supervisory Report operations.
 * Implements create, get, list, and update handlers conforming to Section 11.4.21–25.
 */
import asyncHandler from 'express-async-handler';
import * as reportService from '../services/reportService.js';
import { HTTP_STATUS } from '../config/httpStatus.js';

/**
 * Creates a structured Daily Supervisory Report and paired Chat co-pilot.
 * Supports JSON body as well as multipart/form-data with uploaded audio narrations.
 * @function createReportHandler
 */
export const createReportHandler = asyncHandler(async (req, res) => {
  const result = await reportService.createReport(req.user._id, req.validated.body, req.files || []);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Report created successfully',
    data: result,
  });
});

/**
 * Streams an audio clip binary to authenticated supervisor (Method 1).
 * @function getReportAudioClipHandler
 */
export const getReportAudioClipHandler = asyncHandler(async (req, res) => {
  const { clip, filePath } = await reportService.getReportAudioClip(
    req.user._id,
    req.params.reportId,
    req.params.clipId
  );

  res.setHeader('Content-Type', clip.mimeType || 'audio/wav');
  res.sendFile(filePath);
});

/**
 * Retrieves a single report by ID.
 * @function getReportHandler
 */
export const getReportHandler = asyncHandler(async (req, res) => {
  const report = await reportService.getReportById(req.user._id, req.validated.params.reportId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Report retrieved successfully',
    data: report,
  });
});

/**
 * Retrieves paginated reports for authenticated supervisor.
 * @function listReportsHandler
 */
export const listReportsHandler = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.user._id, req.validated.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Reports retrieved successfully',
    data: result,
  });
});

/**
 * Updates an existing report.
 * @function updateReportHandler
 */
export const updateReportHandler = asyncHandler(async (req, res) => {
  const report = await reportService.updateReport(
    req.user._id,
    req.validated.params.reportId,
    req.validated.body
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Report updated successfully',
    data: report,
  });
});
