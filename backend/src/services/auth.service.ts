import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { fallbackDb, isPostgresConnected, prisma } from '../database/prisma';

export class AuthService {
  async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;

    if (isPostgresConnected) {
      user = await prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      });
    } else {
      user = fallbackDb.adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      throw { statusCode: 401, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
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
      const user = fallbackDb.adminUsers.find((u) => u.id === userId);
      if (!user) throw { statusCode: 404, message: 'المستخدم غير موجود' };
      const { passwordHash, ...rest } = user;
      return rest;
    }
  }
}

export const authService = new AuthService();
