import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3, 'كود الكوبون لا يقل عن 3 أحرف').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.number().positive('قيمة الخصم يجب أن تكون أكبر من 0'),
  isActive: z.boolean().default(true),
  expiryDate: z.string().datetime().optional().nullable(),
});

export const updateCouponSchema = createCouponSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
