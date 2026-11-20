import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { isPostgresConnected, isolatedTestDb, prisma } from '../database/prisma';

export class AuthService {
  async login(email: string, password: string) {
    if (env.isProduction && !isPostgresConnected) {
      throw { statusCode: 503, message: 'خدمة تسجيل الدخول غير متاحة حالياً لعدم توفر قاعدة البيانات.' };
    }

    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;

    if (isPostgresConnected) {
      user = await prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      });
    } else {
      if (env.isProduction) {
        throw new Error('[Security Exception] In-memory authentication is forbidden in production.');
      }
      user = isolatedTestDb.adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      throw { statusCode: 401, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    // Generate JWT with explicit HS256 algorithm and expiration
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn,
        algorithm: 'HS256',
      } as jwt.SignOptions
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    if (isPostgresConnected) {
      const user = await prisma.adminUser.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      if (!user) throw { statusCode: 404, message: 'المستخدم غير موجود' };
      return user;
    } else {
      const user = isolatedTestDb.adminUsers.find((u) => u.id === userId);
      if (!user) throw { statusCode: 404, message: 'المستخدم غير موجود' };
      const { passwordHash, ...rest } = user;
      return rest;
    }
  }
}

export const authService = new AuthService();
