import { NextFunction, Request, Response } from 'express';
import { couponService } from '../services/coupon.service';

export class CouponController {
  /**
   * Customer: Validate coupon code during checkout
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code || req.body.code;
      const result = await couponService.validateCoupon(code);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get all coupons
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.getAll();
      res.status(200).json({
        success: true,
        count: coupons.length,
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'تم إنشاء الكوبون بنجاح.',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'تم تحديث الكوبون بنجاح.',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.toggleActive(req.params.id);
      res.status(200).json({
        success: true,
        message: coupon.isActive ? 'تم تفعيل الكوبون.' : 'تم تعطيل الكوبون.',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await couponService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'تم حذف الكوبون بنجاح.',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
