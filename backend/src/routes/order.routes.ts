import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// --- Public Customer Routes ---

// 1. Customer Checkout (Enforces COD, atomic stock check, returns unguessable tracking token)
router.post('/', validateRequest(createOrderSchema), orderController.create);

// 2. Customer Secure Order Tracking (Requires valid tracking token, returns minimal public data)
router.get('/track/:orderNumber', orderController.track);
router.post('/track', orderController.track);

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

export default router;
