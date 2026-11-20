import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        brand: req.query.brand as string,
        search: (req.query.search || req.query.q) as string,
        shape: req.query.shape as string,
        material: req.query.material as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        onlyDiscounted: req.query.onlyDiscounted === 'true',
        onlyNew: req.query.onlyNew === 'true',
        sortBy: req.query.sortBy as any,
      };

      const products = await productService.getAll(filters);
      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'تم إضافة المنتج بنجاح.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'تم تحديث بيانات المنتج بنجاح.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await productService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'تم حذف المنتج بنجاح.',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantityChange } = req.body;
      const product = await productService.updateStock(req.params.id, Number(quantityChange));
      res.status(200).json({
        success: true,
        message: 'تم تحديث مخزون المنتج.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
