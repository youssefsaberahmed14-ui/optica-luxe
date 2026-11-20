import { z } from 'zod';

export const eyePrescriptionSchema = z.union([
  z.string().max(100),
  z.number(),
  z.record(z.any()),
]);

export const prescriptionDetailsSchema = z
  .union([
    z.string().max(500),
    z.object({
      rightEyeOD: eyePrescriptionSchema.optional().nullable(),
      leftEyeOS: eyePrescriptionSchema.optional().nullable(),
      pupillaryDistancePD: z.union([z.string(), z.number()]).optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
    }),
    z.record(z.any()),
  ])
  .optional()
  .nullable();

export const createOrderItemSchema = z.object({
  productId: z.string().min(1, 'معرّف المنتج مطلوب'),
  quantity: z.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  selectedColor: z.string().optional().nullable(),
  lensOption: z.string().optional().nullable(),
  prescription: prescriptionDetailsSchema,
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
    .transform(() => 'COD'),
  notes: z.string().optional().nullable(),
  idempotencyKey: z
    .string({
      required_error: 'مفتاح عدم التكرار (Idempotency Key) مطلوب لتأكيد الطلب.',
      invalid_type_error: 'مفتاح عدم التكرار (Idempotency Key) يجب أن يكون نصاً صالحاً.',
    })
    .min(16, 'مفتاح عدم التكرار (Idempotency Key) غير صالح (يجب ألا يقل عن 16 حرفاً).')
    .max(128, 'مفتاح عدم التكرار (Idempotency Key) يتجاوز الحد المسموح به (128 حرفاً).'),
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

export const updateOrderStatusSchema = z
  .object({
    orderStatus: z.preprocess(
      normalizeOrderStatus,
      z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    ),
    paymentStatus: z
      .any()
      .optional()
      .refine((val) => val === undefined, {
        message:
          'لا يمكن تعيين حالة الدفع مباشرة عبر مسار تعديل الحالة العام. يجب تحصيل النقدية حصراً عبر الإجراء المخصص: POST /api/orders/:id/collect-cash بعد تسليم الطلب.',
      }),
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
