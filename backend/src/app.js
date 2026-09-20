/**
 * @module app
 * @description Express application assembly with strict 11-step middleware pipeline.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { HTTP_STATUS } from './config/httpStatus.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { generalRateLimiter } from './middlewares/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { NotFoundError } from './errors/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Root /health endpoint per Section 11.4.1
app.get('/health', (req, res) => {
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
});

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", ...env.ALLOWED_ORIGINS],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true, // Mandatory for transmitting httpOnly auth cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // Pre-flight cache: 24 hours
  })
);

// 3. Response Compression (Bypassing SSE Streams)
app.use(
  compression({
    filter: (req, res) => {
      // Never compress Server-Sent Events streams; compression buffers chunks and breaks real-time delivery
      if (req.headers.accept === 'text/event-stream') {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// 4. Cookie Parsing
app.use(cookieParser());

// 5. Morgan Request Logging
app.use(requestLogger);

// 6. JSON Body Parsing (Bounded to 1MB)
app.use(express.json({ limit: '1mb' }));

// 7. URL-Encoded Form Parsing (Bounded to 1MB)
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 8. NoSQL Injection Sanitization
app.use(
  mongoSanitize({
    allowDots: false,
    replaceWith: '_',
  })
);

// 9. Application Rate Limiting
app.use(generalRateLimiter);

// 10. Authoritative API Route Mount
app.use('/api/v1', apiRouter);

// 11a. 404 Fallback Route Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// 11b. Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
