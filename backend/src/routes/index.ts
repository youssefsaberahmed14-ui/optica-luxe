import { Router } from 'express';
import { env } from '../config/env';
import { checkDatabaseReadiness } from '../database/prisma';
import authRoutes from './auth.routes';
import couponRoutes from './coupon.routes';
import dashboardRoutes from './dashboard.routes';
import orderRoutes from './order.routes';
import productRoutes from './product.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/dashboard', dashboardRoutes);

/**
 * Enhanced Health & Readiness Check Endpoint
 * Distinguishes application status, database status, and overall readiness.
 * Returns 503 in production if database is disconnected.
 */
router.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseReadiness();
  const isReady = dbStatus.ready;

  const payload = {
    application: 'up',
    environment: env.nodeEnv,
    service: 'Optica Luxe E-Commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      latencyMs: dbStatus.latencyMs,
      error: dbStatus.error || null,
    },
    readiness: isReady ? 'ready' : 'unready',
  };

  // In production, an unavailable database marks the service 503
  if (env.isProduction && !isReady) {
    return res.status(503).json(payload);
  }

  return res.status(isReady ? 200 : 200).json(payload);
});

export default router;
