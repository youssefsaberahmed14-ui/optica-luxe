import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';

export const createApp = (): Application => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: [env.corsOrigin, 'http://localhost:4200', 'http://127.0.0.1:4200'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root Welcome route
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'Optica Luxe API',
      description: 'REST API for Optica Luxe Luxury Eyewear Store',
      demoMode: true,
      documentation: '/api/health',
    });
  });

  // Mount API Router
  app.use('/api', apiRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `المسار المطلوب ${req.originalUrl} غير موجود على هذا الخادم.`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
