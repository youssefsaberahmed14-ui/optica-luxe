import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'اسم المنتج بالإنجليزية مطلوب'),
  nameAr: z.string().min(2, 'اسم المنتج بالعربية مطلوب'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive('السعر يجب أن يكون أكبر من 0'),
  oldPrice: z.number().positive().optional().nullable(),
  discountPercent: z.number().int().min(0).max(100).optional().nullable(),
  image: z.string().url('رابط الصورة الرئيسية غير صالح'),
  images: z.array(z.string().url()).optional().default([]),
  category: z.string().min(2, 'الفئة مطلوبة'),
  categoryAr: z.string().optional(),
  brand: z.string().min(2, 'الماركة مطلوبة'),
  brandAr: z.string().optional(),
  stock: z.number().int().min(0, 'المخزون لا يمكن أن يكون سالباً').default(10),
  shape: z.string().optional(),
  shapeAr: z.string().optional(),
  material: z.string().optional(),
  materialAr: z.string().optional(),
  gender: z.string().optional(),
  genderAr: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  sku: z.string().min(3, 'كود SKU مطلوب'),
  colors: z.any().optional(),
  dimensions: z.any().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
