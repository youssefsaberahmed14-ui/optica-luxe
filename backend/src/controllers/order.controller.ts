import { NextFunction, Request, Response } from 'express';
import { orderService } from '../services/order.service';

export class OrderController {
  /**
   * Customer-facing: Checkout order creation.
   * Enforces mandatory idempotencyKey, returns sanitized confirmation DTO and raw tracking token once.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const idempotencyKey =
        (req.headers['idempotency-key'] as string) ||
        (req.headers['x-idempotency-key'] as string) ||
        req.body.idempotencyKey;

      const result = await orderService.createOrder({
        ...req.body,
        idempotencyKey,
      });

      res.status(result.isDuplicate ? 200 : 201).json({
        success: true,
        message: result.isDuplicate
          ? 'تم استرجاع الطلب المسجل مسبقاً بنجاح دون تكرار.'
          : 'تم استلام وتأكيد طلبك بنجاح!',
        data: {
          ...result.order,
          trackingToken: result.trackingToken,
        },
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
   * REJECTS body tokens to enforce strict header-only transport.
   */
  async track(req: Request, res: Response, next: NextFunction) {
    try {
      // Security Check 1: Strictly reject tracking token in URL query parameters
      if (req.query.token !== undefined) {
        return res.status(400).json({
          success: false,
          message:
            'إرسال رمز التتبع عبر معلمات الرابط (URL Query Parameters) غير مسموح به لأسباب أمنية. يرجى إرسال الرمز حصراً عبر الترويسة X-Tracking-Token.',
        });
      }

      // Security Check 2: Strictly reject tracking token in request body
      if (req.body && req.body.token !== undefined) {
        return res.status(400).json({
          success: false,
          message:
            'إرسال رمز التتبع في جسم الطلب (Request Body) غير مسموح به لأسباب أمنية. يرجى إرسال الرمز حصراً عبر الترويسة X-Tracking-Token.',
        });
      }

      const orderNumber = (req.params.orderNumber || req.query.orderNumber) as string;
      const token = req.headers['x-tracking-token'] as string;

      if (!orderNumber || !orderNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: 'رقم الطلب مطلوب للاستعلام عن حالة التتبع.',
        });
      }

      if (!token || typeof token !== 'string' || !token.trim()) {
        return res.status(400).json({
          success: false,
          message: 'الترويسة X-Tracking-Token مطلوبة وتعتبر الوسيلة الوحيدة المصرح بها للتحقق من التتبع.',
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
   * Admin-facing: Update order status.
   * Generic status changes only; rejects setting paymentStatus to PAID.
   * Protected by authenticateAdmin.
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body && req.body.paymentStatus !== undefined) {
        return res.status(400).json({
          success: false,
          message:
            'تعديل حالة الدفع غير مسموح به عبر مسار تعديل الحالة العام. يجب استخدام مسار تحصيل النقدية المخصص: POST /api/orders/:id/collect-cash',
        });
      }

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
