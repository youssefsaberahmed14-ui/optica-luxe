import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Public customer routes
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Protected admin routes
router.post('/', authenticateAdmin, validateRequest(createProductSchema), productController.create);
router.put('/:id', authenticateAdmin, validateRequest(updateProductSchema), productController.update);
router.delete('/:id', authenticateAdmin, productController.delete);
router.patch('/:id/stock', authenticateAdmin, productController.updateStock);

export default router;
