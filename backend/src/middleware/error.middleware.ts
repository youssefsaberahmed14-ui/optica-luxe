import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ [API Error]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
