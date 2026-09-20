/**
 * @module services/sweeperService
 * @description Background sweeper service stub for Phase 1.
 */
import { logger } from '../config/logger.js';

export const initSweeperTasks = () => {
  logger.info('Background sweeper tasks initialized (idle in Phase 1).');
  return {
    stop: () => {
      logger.info('Background sweeper tasks stopped.');
    },
  };
};
