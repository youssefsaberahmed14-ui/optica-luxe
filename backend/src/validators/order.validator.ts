import { z } from 'zod';

export const createOrderItemSchema = z.object({
  productId: z.string().min(1, 'معرّف المنتج مطلوب'),
  quantity: z.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  selectedColor: z.string().optional(),
  lensOption: z.string().optional(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(3, 'الاسم يجب أن لا يقل عن 3 أحرف'),
  phone: z.string().min(8, 'رقم الهاتف غير صالح'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  address: z.string().min(5, 'العنوان بالتفصيل مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  items: z.array(createOrderItemSchema).min(1, 'يجب أن تحتوي السلة على منتج واحد على الأقل'),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z
    .string()
    .optional()
    .transform((val) => {
      // Optica Luxe enforces Cash on Delivery (COD) only
      return 'COD';
    }),
  notes: z.string().optional().nullable(),
  idempotencyKey: z.string().optional().nullable(),
});

const normalizeOrderStatus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const s = val.trim().toUpperCase();
  return s;
};

const normalizePaymentStatus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const s = val.trim().toUpperCase();
  if (s === 'DEMO_PAID' || s === 'DEMO PAID' || s === 'PAID') return 'PAID';
  if (s === 'UNPAID') return 'UNPAID';
  return s;
};

export const updateOrderStatusSchema = z.object({
  orderStatus: z.preprocess(
    normalizeOrderStatus,
    z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  ),
  paymentStatus: z
    .preprocess(normalizePaymentStatus, z.enum(['UNPAID', 'PAID']))
    .optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(3, 'رقم الطلب مطلوب'),
  token: z.string().min(16, 'رمز التتبع غير صالح'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
