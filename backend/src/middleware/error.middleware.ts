import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // In development, log full error; in production, avoid logging sensitive request tokens or stack traces
  if (env.isDevelopment || env.isTest) {
    console.error('❌ [API Error]:', err?.message || err);
  } else {
    console.error('❌ [API Error] Status:', err.statusCode || 500, 'Message:', err.message);
  }

  // Handle CORS errors gracefully
  if (err.message && err.message.includes('[CORS Blocked]')) {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح بالوصول من هذا المصدر (CORS Policy).',
    });
  }

  // Handle Payload Too Large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'حجم الطلب يتجاوز الحد المسموح به (100KB).',
    });
  }

  const statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.';

  // In production, do not leak internal database syntax errors or stack traces
  if (env.isProduction && statusCode === 500) {
    message = 'حدث خطأ غير متوقع في الخادم. تم تسجيل الخطأ داخلياً.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
};
