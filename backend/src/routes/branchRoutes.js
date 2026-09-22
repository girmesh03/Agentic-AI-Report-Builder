/**
 * @module routes/branchRoutes
 * @description Company branch CRUD, filter, search, archive, and restoration route definitions.
 */
import { Router } from 'express';
import * as branchController from '../controllers/branchController.js';
import {
  validateCreateBranch,
  validateUpdateBranch,
  validateBranchIdParam,
  validateListBranches,
} from '../validators/branchValidator.js';
import { authenticate } from '../middlewares/authenticate.js';
import { crudRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Protect all branch endpoints with authentication and CRUD rate limiting
router.use(authenticate);
router.use(crudRateLimiter);

router.get('/', validateListBranches, branchController.getBranchesHandler);
router.post('/', validateCreateBranch, branchController.createBranchHandler);
router.get('/:branchId', validateBranchIdParam, branchController.getBranchDetailsHandler);
router.put('/:branchId', validateUpdateBranch, branchController.updateBranchHandler);
router.delete('/:branchId', validateBranchIdParam, branchController.archiveBranchHandler);
router.patch('/:branchId/restore', validateBranchIdParam, branchController.restoreBranchHandler);

export default router;
