import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { loginRateLimiter } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', loginRateLimiter, validateRequest(loginSchema), authController.login);
router.get('/profile', authenticateAdmin, authController.getProfile);

export default router;
