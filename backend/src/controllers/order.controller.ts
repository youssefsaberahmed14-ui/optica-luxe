import { NextFunction, Request, Response } from 'express';
import { orderService } from '../services/order.service';

export class OrderController {
  /**
   * Customer-facing: Checkout order creation
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({
        success: true,
        message: 'تم استلام وتأكيد طلبك بنجاح!',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-facing: Get all orders with query filters
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

      const orders = await orderService.getAllOrders(filters);
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
   * Get single order by ID or orderNumber
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-facing: Update order status (Pending, Confirmed, Shipped, Delivered, Cancelled)
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body);
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
