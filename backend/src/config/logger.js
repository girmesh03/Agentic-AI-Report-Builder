/**
 * @module config/logger
 * @description Centralized Winston logger with daily rotating file transports and development console formatting.
 */
import path from 'node:path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { env } from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Human-readable format for development terminal
const devConsoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Daily rotate file transport for general logs
const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: combine(timestamp(), errors({ stack: true }), json()),
});

// Daily rotate file transport for error logs
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
  format: combine(timestamp(), errors({ stack: true }), json()),
});

// Console transport (colorized in dev, JSON in prod)
const consoleTransport = new winston.transports.Console({
  format:
    env.NODE_ENV === 'development'
      ? combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), devConsoleFormat)
      : combine(timestamp(), errors({ stack: true }), json()),
});

/**
 * Centralized Winston logger instance configured with console and daily rotating file transports.
 * @type {winston.Logger}
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL || (env.NODE_ENV === 'development' ? 'debug' : 'info'),
  transports: [consoleTransport, combinedFileTransport, errorFileTransport],
  exitOnError: false,
});
