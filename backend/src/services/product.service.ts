import { env } from '../config/env';
import { isPostgresConnected, isolatedTestDb, prisma } from '../database/prisma';

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  shape?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyDiscounted?: boolean;
  onlyNew?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export class ProductService {
  async getAll(filters: ProductFilters = {}) {
    if (env.isProduction && !isPostgresConnected) {
      throw { statusCode: 503, message: 'خدمة المنتجات غير متاحة حالياً لعدم توفر قاعدة البيانات.' };
    }

    if (isPostgresConnected) {
      const where: any = {};

      if (filters.category && filters.category !== 'all') {
        where.category = filters.category;
      }
      if (filters.brand && filters.brand !== 'all') {
        where.brand = { equals: filters.brand, mode: 'insensitive' };
      }
      if (filters.shape && filters.shape !== 'all') {
        where.shape = filters.shape;
      }
      if (filters.material && filters.material !== 'all') {
        where.material = filters.material;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) where.price.gte = Number(filters.minPrice);
        if (filters.maxPrice !== undefined) where.price.lte = Number(filters.maxPrice);
      }
      if (filters.onlyDiscounted) {
        where.discountPercent = { gt: 0 };
      }
      if (filters.onlyNew) {
        where.isNew = true;
      }
      if (filters.search) {
        const q = filters.search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { nameAr: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { brandAr: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { descriptionAr: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      switch (filters.sortBy) {
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'featured':
        default:
          orderBy = [{ isFeatured: 'desc' }, { isBestSeller: 'desc' }, { createdAt: 'desc' }];
          break;
      }

      return prisma.product.findMany({
        where,
        orderBy,
      });
    } else {
      let result = [...isolatedTestDb.products];

      if (filters.category && filters.category !== 'all') {
        result = result.filter((p) => p.category === filters.category);
      }
      if (filters.brand && filters.brand !== 'all') {
        result = result.filter((p) => p.brand.toLowerCase() === filters.brand?.toLowerCase());
      }
      if (filters.shape && filters.shape !== 'all') {
        result = result.filter((p) => p.shape === filters.shape);
      }
      if (filters.material && filters.material !== 'all') {
        result = result.filter((p) => p.material === filters.material);
      }
      if (filters.minPrice !== undefined) {
        result = result.filter((p) => p.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter((p) => p.price <= Number(filters.maxPrice));
      }
      if (filters.onlyDiscounted) {
        result = result.filter((p) => (p.discountPercent || 0) > 0);
      }
      if (filters.onlyNew) {
        result = result.filter((p) => p.isNew);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.nameAr && p.nameAr.includes(q)) ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }

      switch (filters.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }

      return result;
    }
  }

  async getById(id: string) {
    if (env.isProduction && !isPostgresConnected) {
      throw { statusCode: 503, message: 'خدمة المنتجات غير متاحة حالياً لعدم توفر قاعدة البيانات.' };
    }

    if (isPostgresConnected) {
      const product = await prisma.product.findUnique({
        where: { id },
      });
      if (!product) {
        throw { statusCode: 404, message: 'المنتج غير موجود.' };
      }
      return product;
    } else {
      const product = isolatedTestDb.products.find((p) => p.id === id || p.legacyId === id);
      if (!product) {
        throw { statusCode: 404, message: 'المنتج غير موجود.' };
      }
      return product;
    }
  }

  async create(data: any) {
    if (isPostgresConnected) {
      return prisma.product.create({ data });
    } else {
      const newProduct = {
        id: 'opt-' + String(isolatedTestDb.products.length + 1).padStart(3, '0'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      isolatedTestDb.products.push(newProduct);
      return newProduct;
    }
  }

  async update(id: string, data: any) {
    if (isPostgresConnected) {
      return prisma.product.update({
        where: { id },
        data,
      });
    } else {
      const idx = isolatedTestDb.products.findIndex((p) => p.id === id || p.legacyId === id);
      if (idx === -1) throw { statusCode: 404, message: 'المنتج غير موجود.' };
      isolatedTestDb.products[idx] = {
        ...isolatedTestDb.products[idx],
        ...data,
        updatedAt: new Date(),
      };
      return isolatedTestDb.products[idx];
    }
  }

  async delete(id: string) {
    if (isPostgresConnected) {
      return prisma.product.delete({
        where: { id },
      });
    } else {
      const idx = isolatedTestDb.products.findIndex((p) => p.id === id || p.legacyId === id);
      if (idx === -1) throw { statusCode: 404, message: 'المنتج غير موجود.' };
      const deleted = isolatedTestDb.products.splice(idx, 1)[0];
      return deleted;
    }
  }

  async updateStock(id: string, quantityChange: number) {
    if (!Number.isInteger(quantityChange)) {
      throw { statusCode: 400, message: 'مقدار تعديل المخزون يجب أن يكون رقماً صحيحاً.' };
    }
    if (quantityChange === 0) {
      throw { statusCode: 400, message: 'مقدار التعديل يجب أن لا يساوي صفراً.' };
    }

    if (isPostgresConnected) {
      if (quantityChange < 0) {
        const absQty = Math.abs(quantityChange);
        const result = await prisma.product.updateMany({
          where: {
            id,
            stock: { gte: absQty },
          },
          data: {
            stock: { decrement: absQty },
          },
        });

        if (result.count === 0) {
          const existing = await prisma.product.findUnique({ where: { id } });
          if (!existing) throw { statusCode: 404, message: 'المنتج غير موجود.' };
          throw {
            statusCode: 400,
            message: `عذراً، لا يمكن تقليل المخزون بمقدار ${absQty}. المخزون الحالي (${existing.stock}) غير كافٍ.`,
          };
        }
        return prisma.product.findUnique({ where: { id } });
      } else {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw { statusCode: 404, message: 'المنتج غير موجود.' };
        return prisma.product.update({
          where: { id },
          data: {
            stock: { increment: quantityChange },
          },
        });
      }
    } else {
      const product = isolatedTestDb.products.find((p) => p.id === id || p.legacyId === id);
      if (!product) throw { statusCode: 404, message: 'المنتج غير موجود.' };
      if (quantityChange < 0 && product.stock < Math.abs(quantityChange)) {
        throw {
          statusCode: 400,
          message: `عذراً، لا يمكن تقليل المخزون بمقدار ${Math.abs(quantityChange)}. المخزون الحالي (${product.stock}) غير كافٍ.`,
        };
      }
      product.stock += quantityChange;
      return product;
    }
  }
}

export const productService = new ProductService();
