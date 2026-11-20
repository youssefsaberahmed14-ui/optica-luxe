import { Router } from 'express';
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

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Optica Luxe E-Commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demoMode: true,
  });
});

export default router;
