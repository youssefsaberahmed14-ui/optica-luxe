import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

interface AttemptRecord {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

// Simple in-memory rate limiter for login route
export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + env.rateLimitWindowMs,
    });
    return next();
  }

  if (record.count >= env.rateLimitMaxAttempts) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `تم تجاوز الحد المسموح به من محاولات تسجيل الدخول. يرجى الانتظار لمدة ${minutesLeft} دقيقة قبل المحاولة مجدداً.`,
    });
  }

  record.count++;
  next();
};
