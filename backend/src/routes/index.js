/**
 * @module routes/index
 * @description Authoritative /api/v1 router mount.
 */
import { Router } from 'express';
import mongoose from 'mongoose';
import { HTTP_STATUS } from '../config/httpStatus.js';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

export const apiRouter = Router();

/**
 * Health check handler logic matching Section 11.4.1.
 */
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server is healthy',
    data: {
      status: 'up',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime() * 10) / 10,
      database: isDbConnected ? 'connected' : 'disconnected',
    },
  });
};

apiRouter.get('/health', healthHandler);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);

