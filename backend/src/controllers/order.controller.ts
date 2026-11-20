import { NextFunction, Request, Response } from 'express';
import { orderService } from '../services/order.service';

export class OrderController {
  /**
   * Customer-facing: Checkout order creation.
   * Returns order record and returns raw tracking token ONLY ONCE.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Support idempotency key from header or body
      const idempotencyKey =
        (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey || null;

      const result = await orderService.createOrder({
        ...req.body,
        idempotencyKey,
      });

      res.status(result.isDuplicate ? 200 : 201).json({
        success: true,
        message: result.isDuplicate
          ? 'تم استرجاع الطلب المسجل مسبقاً.'
          : 'تم استلام وتأكيد طلبك بنجاح!',
        data: result.order,
        trackingToken: result.trackingToken, // Raw token returned ONLY in this response
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer-facing: Secure Order Tracking.
   * Validates tracking token and order number. Returns only necessary non-sensitive info.
   */
  async track(req: Request, res: Response, next: NextFunction) {
    try {
      const orderNumber = (req.params.orderNumber || req.query.orderNumber || req.body.orderNumber) as string;
      const token = (req.query.token || req.headers['x-tracking-token'] || req.body.token) as string;

      if (!orderNumber || !token) {
        return res.status(400).json({
          success: false,
          message: 'رقم الطلب ورمز التتبع مطلوبان للتحقق من حالة الطلب.',
        });
      }

      const trackingData = await orderService.trackOrder({
        orderNumber,
        token,
      });

      res.status(200).json({
        success: true,
        data: trackingData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-facing: Get all orders with query filters and search.
   * Protected by authenticateAdmin.
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        orderStatus: req.query.orderStatus as string,
        paymentStatus: req.query.paymentStatus as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as any,
      };

      const orders = await orderService.getAllOrdersForAdmin(filters);
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-facing: Get complete order by ID or orderNumber.
   * Protected by authenticateAdmin. Never accessible to public without admin credentials.
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderByIdForAdmin(req.params.id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-facing: Update order status & payment status with transactional safeguards.
   * Protected by authenticateAdmin.
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = (req as any).admin || {};
      const order = await orderService.updateOrderStatus(req.params.id, req.body, actor);
      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
