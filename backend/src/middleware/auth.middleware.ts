import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  admin?: AuthenticatedUser;
}

export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: يجب تسجيل الدخول للوصول إلى لوحة التحكم.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Explicitly enforce HS256 to prevent algorithm manipulation attacks
    const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as AuthenticatedUser;
    req.user = decoded;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'رمز التحقق غير صالح أو منتهي الصلاحية. يرجى إعادة تسجيل الدخول.',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء.',
      });
    }
    next();
  };
};
