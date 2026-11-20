import { fallbackDb, isPostgresConnected, prisma } from '../database/prisma';

export class CouponService {
  async validateCoupon(code: string) {
    const cleanCode = code.trim().toUpperCase();

    let coupon: any = null;
    if (isPostgresConnected) {
      coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });
    } else {
      coupon = fallbackDb.coupons.find((c) => c.code === cleanCode);
    }

    if (!coupon) {
      throw { statusCode: 404, message: 'كود الخصم غير موجود أو غير صالح.' };
    }

    if (!coupon.isActive) {
      throw { statusCode: 400, message: 'كود الخصم غير نشط حالياً.' };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw { statusCode: 400, message: 'كود الخصم منتهي الصلاحية.' };
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message:
        coupon.discountType === 'PERCENTAGE'
          ? `تم تفعيل خصم ${coupon.discountValue}% بنجاح!`
          : `تم تفعيل خصم ${coupon.discountValue} ج.م بنجاح!`,
    };
  }

  async getAll() {
    if (isPostgresConnected) {
      return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    } else {
      return [...fallbackDb.coupons].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  async create(data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    isActive?: boolean;
    expiryDate?: string | null;
  }) {
    const cleanCode = data.code.trim().toUpperCase();

    if (isPostgresConnected) {
      const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
      if (existing) throw { statusCode: 409, message: 'كود الخصم موجود بالفعل' };

      return prisma.coupon.create({
        data: {
          code: cleanCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          isActive: data.isActive !== undefined ? data.isActive : true,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      });
    } else {
      const existing = fallbackDb.coupons.find((c) => c.code === cleanCode);
      if (existing) throw { statusCode: 409, message: 'كود الخصم موجود بالفعل' };

      const newCoupon = {
        id: 'cpn-' + Math.random().toString(36).substring(2, 7),
        code: cleanCode,
        discountType: data.discountType,
        discountValue: data.discountValue,
        isActive: data.isActive !== undefined ? data.isActive : true,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackDb.coupons.push(newCoupon);
      return newCoupon;
    }
  }

  async update(id: string, data: any) {
    if (isPostgresConnected) {
      return prisma.coupon.update({
        where: { id },
        data: {
          ...data,
          ...(data.code && { code: data.code.toUpperCase() }),
          ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
        },
      });
    } else {
      const idx = fallbackDb.coupons.findIndex((c) => c.id === id);
      if (idx === -1) throw { statusCode: 404, message: 'الكوبون غير موجود' };

      fallbackDb.coupons[idx] = {
        ...fallbackDb.coupons[idx],
        ...data,
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
        updatedAt: new Date(),
      };
      return fallbackDb.coupons[idx];
    }
  }

  async toggleActive(id: string) {
    if (isPostgresConnected) {
      const coupon = await prisma.coupon.findUnique({ where: { id } });
      if (!coupon) throw { statusCode: 404, message: 'الكوبون غير موجود' };
      return prisma.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
      });
    } else {
      const coupon = fallbackDb.coupons.find((c) => c.id === id);
      if (!coupon) throw { statusCode: 404, message: 'الكوبون غير موجود' };
      coupon.isActive = !coupon.isActive;
      coupon.updatedAt = new Date();
      return coupon;
    }
  }

  async delete(id: string) {
    if (isPostgresConnected) {
      return prisma.coupon.delete({ where: { id } });
    } else {
      const idx = fallbackDb.coupons.findIndex((c) => c.id === id);
      if (idx === -1) throw { statusCode: 404, message: 'الكوبون غير موجود' };
      const deleted = fallbackDb.coupons.splice(idx, 1)[0];
      return deleted;
    }
  }
}

export const couponService = new CouponService();
