/**
 * @module routes/reportRoutes
 * @description Express routing definition for Daily Supervisory Report endpoints.
 * Mounted at /api/v1/reports.
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadAudioFiles } from '../middlewares/uploadMiddleware.js';
import * as reportController from '../controllers/reportController.js';
import {
  validateCreateReport,
  validateReportIdParam,
  validateListReports,
} from '../validators/reportValidator.js';

const router = Router();

/**
 * Middleware to parse stringified JSON arrays from multipart FormData.
 */
const parseMultipartJsonFields = (req, res, next) => {
  ['visits', 'activities', 'issues', 'comments'].forEach((field) => {
    if (typeof req.body?.[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch {
        // Leave unparsed for express-validator error reporting
      }
    }
  });
  next();
};

// All report routes require valid authentication
router.use(authenticate);

router
  .route('/')
  .post(uploadAudioFiles, parseMultipartJsonFields, validateCreateReport, reportController.createReportHandler)
  .get(validateListReports, reportController.listReportsHandler);

router
  .route('/:reportId')
  .get(validateReportIdParam, reportController.getReportHandler)
  .put(validateReportIdParam, reportController.updateReportHandler);

// Method 1: Authenticated audio clip binary streaming
router.get(
  '/:reportId/clips/:clipId',
  validateReportIdParam,
  reportController.getReportAudioClipHandler
);

export default router;

