import { NextFunction, Request, Response, Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { checkoutRateLimiter, trackingRateLimiter } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

/**
 * Middleware: Extract Idempotency-Key from HTTP header into req.body if not already in body.
 * Supports standard 'Idempotency-Key' and 'X-Idempotency-Key' headers.
 */
const extractIdempotencyKey = (req: Request, res: Response, next: NextFunction) => {
  const headerKey =
    (req.headers['idempotency-key'] as string) ||
    (req.headers['x-idempotency-key'] as string);

  if (headerKey && (!req.body || !req.body.idempotencyKey)) {
    req.body = req.body || {};
    req.body.idempotencyKey = headerKey;
  }
  next();
};

// --- Public Customer Routes ---

// 1. Customer Checkout (Enforces COD, mandatory idempotency key, rate limited, returns raw tracking token once)
router.post(
  '/',
  checkoutRateLimiter,
  extractIdempotencyKey,
  validateRequest(createOrderSchema),
  orderController.create
);

// 2. Customer Secure Order Tracking (STRICTLY requires X-Tracking-Token header, rejects query and body tokens)
router.get('/track/:orderNumber', trackingRateLimiter, orderController.track);
router.post('/track', trackingRateLimiter, orderController.track);

// --- Protected Admin Routes (STRICTLY require valid JWT admin authentication) ---

// 3. List and search all orders
router.get('/', authenticateAdmin, orderController.getAll);

// 4. View complete customer order details (Protected: never public)
router.get('/:id', authenticateAdmin, orderController.getById);

// 5. Update order status (Generic status changes only; strictly rejects setting paymentStatus to PAID)
router.patch(
  '/:id/status',
  authenticateAdmin,
  validateRequest(updateOrderStatusSchema),
  orderController.updateStatus
);

// 6. Dedicated Cash on Delivery Cash Collection Action (Atomic, idempotent, prevents duplicate audit records)
router.post('/:id/collect-cash', authenticateAdmin, orderController.collectCash);

export default router;
