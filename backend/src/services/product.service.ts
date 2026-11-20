import { fallbackDb, isPostgresConnected, prisma } from '../database/prisma';

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
          { descriptionAr: { contains: q, mode: 'insensitive' } },
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
          orderBy = { isNew: 'desc' };
          break;
        case 'featured':
        default:
          orderBy = { isFeatured: 'desc' };
          break;
      }

      return prisma.product.findMany({
        where,
        orderBy,
      });
    } else {
      // In-Memory Fallback
      let result = [...fallbackDb.products];

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
            p.nameAr?.includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.brandAr?.includes(q) ||
            p.categoryAr?.includes(q)
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
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }

      return result;
    }
  }

  async getById(id: string) {
    if (isPostgresConnected) {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) throw { statusCode: 404, message: 'المنتج غير موجود' };
      return product;
    } else {
      const product = fallbackDb.products.find((p) => p.id === id);
      if (!product) throw { statusCode: 404, message: 'المنتج غير موجود' };
      return product;
    }
  }

  async create(data: any) {
    if (isPostgresConnected) {
      return prisma.product.create({ data });
    } else {
      const newProduct = {
        id: 'opt-' + String(fallbackDb.products.length + 1).padStart(3, '0'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackDb.products.push(newProduct);
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
      const idx = fallbackDb.products.findIndex((p) => p.id === id);
      if (idx === -1) throw { statusCode: 404, message: 'المنتج غير موجود' };
      fallbackDb.products[idx] = {
        ...fallbackDb.products[idx],
        ...data,
        updatedAt: new Date(),
      };
      return fallbackDb.products[idx];
    }
  }

  async delete(id: string) {
    if (isPostgresConnected) {
      return prisma.product.delete({ where: { id } });
    } else {
      const idx = fallbackDb.products.findIndex((p) => p.id === id);
      if (idx === -1) throw { statusCode: 404, message: 'المنتج غير موجود' };
      const deleted = fallbackDb.products.splice(idx, 1)[0];
      return deleted;
    }
  }

  async updateStock(id: string, quantityChange: number) {
    if (isPostgresConnected) {
      return prisma.product.update({
        where: { id },
        data: { stock: { increment: quantityChange } },
      });
    } else {
      const product = fallbackDb.products.find((p) => p.id === id);
      if (product) {
        product.stock = Math.max(0, product.stock + quantityChange);
      }
      return product;
    }
  }
}

export const productService = new ProductService();
