import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Global Prisma Client instance
export const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

// Live database connectivity status
export let isPostgresConnected = false;
let isShuttingDown = false;

export interface DatabaseReadiness {
  ready: boolean;
  status: 'connected' | 'disconnected';
  latencyMs?: number;
  error?: string | null;
}

/**
 * Performs a live ping against PostgreSQL.
 */
export async function checkDatabaseReadiness(): Promise<DatabaseReadiness> {
  if (isShuttingDown) {
    return { ready: false, status: 'disconnected', error: 'Server is shutting down' };
  }

  const start = Date.now();
  try {
    // 3-second timeout for readiness check
    await Promise.race([
      prisma.$queryRawUnsafe('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database ping timed out')), 3000)),
    ]);
    const latencyMs = Date.now() - start;
    isPostgresConnected = true;
    return { ready: true, status: 'connected', latencyMs };
  } catch (error: any) {
    isPostgresConnected = false;
    return {
      ready: false,
      status: 'disconnected',
      error: error?.message || 'Database connection error',
    };
  }
}

/**
 * Initializes database connection at server startup.
 * Enforces PostgreSQL strictly in production.
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    isPostgresConnected = true;
    console.log('✅ [Database] Successfully connected to PostgreSQL via Prisma ORM.');
    return true;
  } catch (error: any) {
    isPostgresConnected = false;
    const errorMsg = error?.message || 'Unknown database connection error';

    // Production MUST fail-fast if PostgreSQL is unreachable. Zero in-memory fallback.
    if (env.isProduction) {
      console.error('❌ [Database Fatal] PostgreSQL connection failed in PRODUCTION mode:');
      console.error(errorMsg);
      throw new Error(
        `[Fatal Database Error] PostgreSQL is mandatory in production. Connection failed: ${errorMsg}`
      );
    }

    // In non-production development/test without PostgreSQL, log clear warning.
    console.warn('⚠️ [Database] Could not connect to PostgreSQL on specified DATABASE_URL.');
    console.warn(`⚠️ [Database] Connection error: ${errorMsg}`);

    if (env.isTest) {
      console.info('ℹ️ [Database] Running in test mode. Isolated test harness will govern persistence.');
    }

    return false;
  }
}

/**
 * Graceful database disconnect for server shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  isShuttingDown = true;
  isPostgresConnected = false;
  try {
    await prisma.$disconnect();
    console.log('🔒 [Database] Prisma client disconnected cleanly.');
  } catch (err) {
    console.error('⚠️ [Database] Error during Prisma disconnect:', err);
  }
}

/**
 * Isolated Test Fallback Store
 * ONLY accessible in test environments when explicitly invoked by test fixtures.
 * STRICTLY forbidden in production.
 */
export interface IsolatedTestData {
  products: any[];
  orders: any[];
  orderItems: any[];
  coupons: any[];
  adminUsers: any[];
  statusHistory: any[];
}

export const isolatedTestDb: IsolatedTestData = {
  products: [],
  orders: [],
  orderItems: [],
  coupons: [],
  adminUsers: [],
  statusHistory: [],
};

export function resetIsolatedTestDb() {
  isolatedTestDb.products = [];
  isolatedTestDb.orders = [];
  isolatedTestDb.orderItems = [];
  isolatedTestDb.coupons = [];
  isolatedTestDb.adminUsers = [];
  isolatedTestDb.statusHistory = [];
}

export const TEST_UUIDS = {
  cartier: 'c0000000-0000-4000-8000-000000000001',
  tomFord: 'c0000000-0000-4000-8000-000000000002',
  lindberg: 'c0000000-0000-4000-8000-000000000003',
  maybach: 'c0000000-0000-4000-8000-000000000004',
};

export async function seedIsolatedTestData() {
  resetIsolatedTestDb();

  // 1. Seed Products with valid standard UUIDs
  isolatedTestDb.products = [
    {
      id: TEST_UUIDS.cartier,
      legacyId: 'opt-001',
      name: 'Cartier Santos-Dumont Gold Edition',
      nameAr: 'نظارة كارتييه سانتوس دومون مطلية بالذهب',
      price: 3200,
      oldPrice: 3800,
      discountPercent: 15,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
      images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083'],
      category: 'sunglasses',
      brand: 'Cartier',
      stock: 10,
      sku: 'OPT-CRT-001',
      isFeatured: true,
      colors: [{ name: 'Gold', nameAr: 'ذهب خالص', code: '#D4AF37' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: TEST_UUIDS.tomFord,
      legacyId: 'opt-002',
      name: 'Tom Ford Snowdon Classic Acetate',
      nameAr: 'نظارة توم فورد سنودون كلاسيك أسيتات',
      price: 1950,
      oldPrice: null,
      discountPercent: 0,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f'],
      category: 'sunglasses',
      brand: 'Tom Ford',
      stock: 15,
      sku: 'OPT-TFD-002',
      isFeatured: true,
      colors: [{ name: 'Black', nameAr: 'أسود ملكي', code: '#121212' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: TEST_UUIDS.lindberg,
      legacyId: 'opt-003',
      name: 'Lindberg Air Rim Titanium Medical',
      nameAr: 'نظارة ليندبيرغ إير ريم تيتانيوم طبي',
      price: 2800,
      oldPrice: 3200,
      discountPercent: 12,
      image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67',
      images: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67'],
      category: 'eyeglasses',
      brand: 'Lindberg',
      stock: 5,
      sku: 'OPT-LND-003',
      isFeatured: false,
      colors: [{ name: 'Silver', nameAr: 'فضي تيتانيوم', code: '#E5E4E2' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: TEST_UUIDS.maybach,
      legacyId: 'opt-last-item',
      name: 'Maybach The Diplomat Limited Gold',
      nameAr: 'مايباخ ذا ديبلومات الإصدار المحدود',
      price: 9500,
      oldPrice: null,
      discountPercent: 0,
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4',
      images: ['https://images.unsplash.com/photo-1508296695146-257a814070b4'],
      category: 'luxury-frames',
      brand: 'Maybach',
      stock: 1, // EXACTLY 1 in stock for Scenario A concurrency test!
      sku: 'OPT-MBH-001',
      isFeatured: true,
      colors: [{ name: 'Gold', nameAr: 'ذهب 18', code: '#D4AF37' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 2. Seed Coupons
  isolatedTestDb.coupons = [
    {
      id: 'cpn-001',
      code: 'LUXE2026',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      isActive: true,
      expiryDate: new Date('2028-12-31'),
      usageCount: 0,
      maxUses: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cpn-exhausted',
      code: 'EXHAUSTED',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      isActive: true,
      expiryDate: new Date('2028-12-31'),
      usageCount: 10,
      maxUses: 10, // Usage limit reached!
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cpn-expired',
      code: 'EXPIRED10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      isActive: true,
      expiryDate: new Date('2020-01-01'),
      usageCount: 0,
      maxUses: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cpn-disabled',
      code: 'DISABLED20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: false,
      expiryDate: new Date('2028-12-31'),
      usageCount: 0,
      maxUses: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 3. Seed Admin
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash('Admin@TestPass123!', 10);
  isolatedTestDb.adminUsers = [
    {
      id: 'usr-admin-test',
      name: 'Test Administrator',
      email: 'admin@optica-luxe.com',
      passwordHash,
      role: 'SUPERADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
