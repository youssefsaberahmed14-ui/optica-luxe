import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// Public customer checkout route
router.post('/', validateRequest(createOrderSchema), orderController.create);

// Order lookup (customer order confirmation or admin)
router.get('/:id', orderController.getById);

// Protected admin routes
router.get('/', authenticateAdmin, orderController.getAll);
router.patch('/:id/status', authenticateAdmin, validateRequest(updateOrderStatusSchema), orderController.updateStatus);

export default router;
