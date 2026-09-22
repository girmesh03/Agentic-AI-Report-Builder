/**
 * @module routes/authRoutes
 * @description Authentication and session lifecycle route definitions.
 */
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateGoogleCallback,
} from '../validators/authValidator.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', validateRegister, authController.registerHandler);
router.post('/login', validateLogin, authController.loginHandler);
router.post('/refresh', authController.refreshHandler);
router.post('/logout', authController.logoutHandler);
router.get('/google/url', authController.googleAuthUrlHandler);
router.post('/google/callback', validateGoogleCallback, authController.googleCallbackHandler);
router.get('/avatar', authenticate, authController.avatarStreamHandler);

export default router;
