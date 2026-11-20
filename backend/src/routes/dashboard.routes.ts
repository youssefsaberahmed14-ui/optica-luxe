import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protected admin metrics overview
router.get('/overview', authenticateAdmin, dashboardController.getOverview);

export default router;
