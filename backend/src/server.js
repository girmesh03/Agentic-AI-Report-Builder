/**
 * @module server
 * @description Application entrypoint, HTTP server initialization, and lifecycle manager.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initSweeperTasks } from './services/sweeperService.js';

// Phase 1: Defensive Pre-boot Directory Initialization
const requiredDirectories = [
  path.resolve('logs'),
  path.resolve('uploads', 'avatars'),
  path.resolve('uploads', 'audio'),
  path.resolve('uploads', 'temp'),
];

requiredDirectories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Phase 2: Database Connection Initialization
await connectDB();

// Phase 3: Background Scheduled Tasks Initialization
const sweeperTask = initSweeperTasks();

// Phase 4: HTTP Server Creation & Port Binding
const server = http.createServer(app);
const PORT = env.PORT || 4000;

server.listen(PORT, () => {
  logger.info(`Report Builder Backend running in [${env.NODE_ENV}] mode on port ${PORT}`);
  logger.info(`API base URL: http://localhost:${PORT}/api/v1`);
});

/**
 * Orchestrates a graceful shutdown of the HTTP server, scheduled jobs, and MongoDB connection.
 * Guards against closing unstarted servers to prevent ERR_SERVER_NOT_RUNNING exceptions.
 *
 * @function handleGracefulShutdown
 * @param {string} signal - The triggering OS termination signal or exception type.
 * @returns {void}
 */
const handleGracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: initiating graceful shutdown protocol...`);

  // 1. Forceful shutdown failsafe timeout (10 seconds)
  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded (10s). Forcing termination.');
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  const drainResourcesAndExit = () => {
    // 3. Stop background sweeper tasks
    if (sweeperTask) {
      sweeperTask.stop();
      logger.info('Background sweeper tasks halted.');
    }

    // 4. Close MongoDB connection pool cleanly
    import('mongoose').then(({ default: mongoose }) => {
      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection pool drained and closed cleanly.');
        logger.info('Graceful shutdown completed successfully. Process exiting.');
        process.exit(signal.includes('EXCEPTION') || signal.includes('REJECTION') ? 1 : 0);
      }).catch((dbErr) => {
        logger.error('Error draining MongoDB connection pool:', dbErr);
        process.exit(1);
      });
    });
  };

  // 2. Stop receiving incoming HTTP connections (only if listening)
  if (server.listening) {
    server.close((serverErr) => {
      if (serverErr) {
        logger.error('Error occurred while closing HTTP server:', serverErr);
      } else {
        logger.info('HTTP server closed. Zero incoming requests accepted.');
      }
      drainResourcesAndExit();
    });
  } else {
    drainResourcesAndExit();
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Phase 6: Uncaught Exception & Rejection Handlers
process.on('uncaughtException', (err) => {
  logger.error('FATAL UNCAUGHT EXCEPTION:', err);
  handleGracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
  handleGracefulShutdown('UNHANDLED_REJECTION');
});

export { server };
