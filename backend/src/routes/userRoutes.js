/**
 * @module routes/userRoutes
 * @description User self-service profile, avatar, password, and account deletion route definitions.
 */
import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import {
  validateUpdateProfile,
  validateChangePassword,
  validateDeleteAccount,
} from '../validators/userValidator.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfileHandler);
router.patch('/me', validateUpdateProfile, userController.updateProfileHandler);
router.post('/me/avatar', uploadAvatar.single('avatar'), userController.uploadAvatarHandler);
router.put('/me/password', validateChangePassword, userController.changePasswordHandler);
router.delete('/me', validateDeleteAccount, userController.deleteAccountHandler);

export default router;
