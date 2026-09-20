/**
 * @module config/db
 * @description Mongoose connection manager with exponential backoff retry.
 */
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const BACKOFF_FACTOR = 2;
const MAX_BOOT_RETRIES = 10;

let currentRetryAttempt = 0;

/**
 * Calculates exponential backoff delay with 10% jitter.
 * @param {number} attempt - Current consecutive failure attempt count.
 * @returns {number} Delay in milliseconds.
 */
const calculateBackoffDelay = (attempt) => {
  const baseDelay = Math.min(INITIAL_DELAY_MS * Math.pow(BACKOFF_FACTOR, attempt), MAX_DELAY_MS);
  const jitter = baseDelay * 0.1 * (Math.random() * 2 - 1); // +/- 10%
  return Math.round(baseDelay + jitter);
};

/**
 * Connects to MongoDB with exponential backoff retry.
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async () => {
  const options = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  while (currentRetryAttempt < MAX_BOOT_RETRIES) {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, options);
      logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
      currentRetryAttempt = 0; // Reset retry counter upon success
      return conn;
    } catch (error) {
      currentRetryAttempt += 1;
      const delay = calculateBackoffDelay(currentRetryAttempt);
      logger.warn(
        `MongoDB connection attempt ${currentRetryAttempt}/${MAX_BOOT_RETRIES} failed: ${error.message}. Retrying in ${delay}ms...`
      );

      if (currentRetryAttempt >= MAX_BOOT_RETRIES) {
        logger.error(`FATAL: Could not connect to MongoDB after ${MAX_BOOT_RETRIES} attempts.`);
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Lifecycle Event Listeners
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Driver attempting automatic background reconnection...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB driver successfully reconnected to cluster.');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB operational error encountered:', err);
});
