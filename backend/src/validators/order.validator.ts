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
  paymentMethod: z.string().default('demo_card'),
  notes: z.string().optional().nullable(),
});

const normalizeOrderStatus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const s = val.trim().toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'processing') return 'Processing';
  if (s === 'shipped') return 'Shipped';
  if (s === 'delivered') return 'Delivered';
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
  return val;
};

const normalizePaymentStatus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const s = val.trim().toLowerCase();
  if (s === 'demo_paid' || s === 'demo paid' || s === 'paid') return 'Demo Paid';
  if (s === 'unpaid') return 'Unpaid';
  if (s === 'refunded') return 'Refunded';
  return val;
};

export const updateOrderStatusSchema = z.object({
  orderStatus: z.preprocess(
    normalizeOrderStatus,
    z.enum(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
  ),
  paymentStatus: z
    .preprocess(
      normalizePaymentStatus,
      z.enum(['Unpaid', 'Demo Paid', 'Refunded'])
    )
    .optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
