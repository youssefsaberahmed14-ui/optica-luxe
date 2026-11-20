import cors, { CorsOptions } from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';

export const createApp = (): Application => {
  const app = express();

  // 1. HTTP Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: env.isProduction ? undefined : false,
    })
  );

  // 2. Strict Production CORS Configuration
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().toLowerCase();
      const isAllowed = env.allowedCorsOrigins.some(
        (allowed) => allowed.toLowerCase() === normalizedOrigin
      );

      if (isAllowed) {
        return callback(null, true);
      }

      // Reject unauthorized origins strictly in production
      return callback(
        new Error(`[CORS Blocked] The origin "${origin}" is not authorized by Optica Luxe security policy.`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tracking-Token',
      'Idempotency-Key',
      'X-Idempotency-Key',
    ],
    exposedHeaders: ['X-Tracking-Token', 'Idempotency-Key'],
    maxAge: 86400, // 24 hours preflight cache
  };

  app.use(cors(corsOptions));

  // 3. Request Body Parsing with Strict Size Limits (100kb)
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 4. Root Welcome Route (Production status, no misleading demo flags)
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'Optica Luxe API',
      description: 'Production REST API for Optica Luxe Luxury Eyewear Store',
      environment: env.nodeEnv,
      status: 'active',
      version: '1.0.0',
      health: '/api/health',
    });
  });

  // 5. Mount API Router
  app.use('/api', apiRoutes);

  // 6. 404 Route Not Found Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `المسار المطلوب ${req.originalUrl} غير موجود على هذا الخادم.`,
    });
  });

  // 7. Global Error Handler
  app.use(errorHandler);

  return app;
};
