import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// In test environment, bypass rate limits to avoid throttling automated test suites
const isTest = env.isTest;

/**
 * Rate Limiter for Authentication endpoints (login, refresh)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 10, // Max 10 attempts per 15 minutes in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة.',
  },
  skip: () => isTest,
});

export const loginRateLimiter = authRateLimiter;

/**
 * Rate Limiter for Public Order Checkout
 */
export const checkoutRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isTest ? 10000 : 25, // Max 25 checkouts per IP in 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم استقبال عدد كبير من الطلبات من هذا العنوان. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.',
  },
  skip: () => isTest,
});

/**
 * Rate Limiter for Order Tracking queries
 */
export const trackingRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isTest ? 10000 : 60, // Max 60 queries per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لاستعلامات التتبع. يرجى المحاولة لاحقاً.',
  },
  skip: () => isTest,
});
