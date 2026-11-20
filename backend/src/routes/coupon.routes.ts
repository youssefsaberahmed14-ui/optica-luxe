import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';

const router = Router();

// Public: Validate coupon at checkout
router.get('/validate/:code', couponController.validate);

// Protected admin routes
router.get('/', authenticateAdmin, couponController.getAll);
router.post('/', authenticateAdmin, validateRequest(createCouponSchema), couponController.create);
router.put('/:id', authenticateAdmin, validateRequest(updateCouponSchema), couponController.update);
router.patch('/:id/toggle', authenticateAdmin, couponController.toggleActive);
router.delete('/:id', authenticateAdmin, couponController.delete);

export default router;
