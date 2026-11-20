/**
 * Optica Luxe — Secure Admin Bootstrap Script
 * Run with: npm run bootstrap:admin
 * 
 * Usage in Production:
 * ADMIN_EMAIL=security@optica-luxe.com ADMIN_PASSWORD="SuperSecurePassword123!" npm run bootstrap:admin
 */

import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { disconnectDatabase, initializeDatabase, isPostgresConnected, prisma } from '../database/prisma';

async function bootstrapAdmin() {
  console.log('🔒 [Optica Luxe] Initializing Secure Admin Bootstrap...');

  const email = env.adminEmail;
  const password = env.adminPassword;
  const name = env.adminName || 'Optica Luxe Administrator';

  if (!email || !password) {
    console.error('❌ [Bootstrap Error] ADMIN_EMAIL and ADMIN_PASSWORD environment variables are strictly required.');
    process.exit(1);
  }

  if (env.isProduction) {
    if (password.length < 12) {
      console.error('❌ [Bootstrap Error] Production password must be at least 12 characters.');
      process.exit(1);
    }
  }

  await initializeDatabase();

  if (!isPostgresConnected) {
    console.error('❌ [Bootstrap Error] Cannot bootstrap admin: PostgreSQL connection is unavailable.');
    process.exit(1);
  }

  console.log(`🔐 Hashing admin credentials with bcrypt (cost factor: 12)...`);
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      name,
      passwordHash,
      role: 'SUPERADMIN',
    },
    create: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'SUPERADMIN',
    },
  });

  console.log(`✅ [Bootstrap Success] Superadmin user ready: ${admin.email} (ID: ${admin.id})`);
  console.log(`🛡️ Role: ${admin.role} | Password has been securely hashed. No secrets printed.`);

  await disconnectDatabase();
}

bootstrapAdmin().catch(async (err) => {
  console.error('❌ [Bootstrap Fatal]:', err?.message || err);
  await disconnectDatabase();
  process.exit(1);
});
