import { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getOverview();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
