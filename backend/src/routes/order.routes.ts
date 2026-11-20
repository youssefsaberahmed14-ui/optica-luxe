import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { checkoutRateLimiter, trackingRateLimiter } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// --- Public Customer Routes ---

// 1. Customer Checkout (Enforces COD, atomic stock check, rate limited, returns unguessable tracking token)
router.post(
  '/',
  checkoutRateLimiter,
  validateRequest(createOrderSchema),
  orderController.create
);

// 2. Customer Secure Order Tracking (STRICTLY requires X-Tracking-Token header, rejects query string tokens)
router.get('/track/:orderNumber', trackingRateLimiter, orderController.track);
router.post('/track', trackingRateLimiter, orderController.track);

// --- Protected Admin Routes (STRICTLY require valid JWT admin authentication) ---

// 3. List and search all orders
router.get('/', authenticateAdmin, orderController.getAll);

// 4. View complete customer order details (Protected: never public)
router.get('/:id', authenticateAdmin, orderController.getById);

// 5. Update order status and payment status (Protected: transactional with stock restoration)
router.patch(
  '/:id/status',
  authenticateAdmin,
  validateRequest(updateOrderStatusSchema),
  orderController.updateStatus
);

// 6. Dedicated Cash on Delivery Cash Collection Action (Protected: transactional & idempotent)
router.post('/:id/collect-cash', authenticateAdmin, orderController.collectCash);

export default router;
