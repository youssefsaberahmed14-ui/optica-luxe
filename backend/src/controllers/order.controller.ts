import { NextFunction, Request, Response } from 'express';
import { orderService } from '../services/order.service';

export class OrderController {
  /**
   * Customer-facing: Checkout order creation.
   * Returns a strictly sanitized order confirmation DTO and raw tracking token ONLY ONCE.
   * Never exposes internal database IDs, full customer address, email, phone, or token hash.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Support idempotency key from HTTP header (preferred) or body
      const idempotencyKey =
        (req.headers['idempotency-key'] as string) ||
        (req.headers['x-idempotency-key'] as string) ||
        req.body.idempotencyKey ||
        null;

      const result = await orderService.createOrder({
        ...req.body,
        idempotencyKey,
      });

      res.status(result.isDuplicate ? 200 : 201).json({
        success: true,
        message: result.isDuplicate
          ? 'تم استرجاع الطلب المسجل مسبقاً بنجاح دون تكرار.'
          : 'تم استلام وتأكيد طلبك بنجاح!',
        data: result.order, // Strictly sanitized DTO
        trackingToken: result.trackingToken, // Raw unguessable token returned ONLY in this response
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer-facing: Secure Order Tracking.
   * STRICTLY transmits tracking token via X-Tracking-Token header.
   * REJECTS query-string tokens (?token=...) to avoid token leakage in URL history/logs.
   */
  async track(req: Request, res: Response, next: NextFunction) {
    try {
      // Security Check: Strictly reject tracking token in URL query parameters
      if (req.query.token !== undefined) {
        return res.status(400).json({
          success: false,
          message:
            'إرسال رمز التتبع عبر معلمات الرابط (URL Query Parameters) غير مسموح به لأسباب أمنية. يرجى إرسال الرمز حصراً عبر الترويسة X-Tracking-Token.',
        });
      }

      const orderNumber = (req.params.orderNumber || req.query.orderNumber || req.body.orderNumber) as string;
      const token = (req.headers['x-tracking-token'] || req.body?.token) as string;

      if (!orderNumber || !token) {
        return res.status(400).json({
          success: false,
          message: 'رقم الطلب والترويسة X-Tracking-Token مطلوبان للاستعلام عن حالة الطلب.',
        });
      }

      // Never log tracking token to server logs
      const trackingData = await orderService.trackOrder({
        orderNumber: orderNumber.trim(),
        token: token.trim(),
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
   * Admin-facing: Confirm Cash Collection for Cash on Delivery (COD) orders.
   * Dedicated endpoint: POST /api/orders/:id/collect-cash
   * Protected by authenticateAdmin.
   */
  async collectCash(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = (req as any).admin || {};
      const result = await orderService.collectCash(req.params.id, actor);

      res.status(200).json({
        success: true,
        message: result.message,
        alreadyPaid: result.alreadyPaid,
        data: result.order,
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
