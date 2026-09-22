/**
 * @module routes/reportRoutes
 * @description Express routing definition for Daily Supervisory Report endpoints.
 * Mounted at /api/v1/reports.
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import * as reportController from '../controllers/reportController.js';
import {
  validateCreateReport,
  validateReportIdParam,
  validateListReports,
} from '../validators/reportValidator.js';

const router = Router();

// All report routes require valid authentication
router.use(authenticate);

router
  .route('/')
  .post(validateCreateReport, reportController.createReportHandler)
  .get(validateListReports, reportController.listReportsHandler);

router
  .route('/:reportId')
  .get(validateReportIdParam, reportController.getReportHandler)
  .put(validateReportIdParam, reportController.updateReportHandler);

export default router;
