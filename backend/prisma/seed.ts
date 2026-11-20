import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Optica Luxe database seed...');

  // 1. Seed Admin User
  let adminEmail: string | undefined = env.adminEmail;
  let adminPassword: string | undefined = env.adminPassword;

  if (env.isProduction) {
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ [Seed] In production, ADMIN_EMAIL and ADMIN_PASSWORD must be explicitly provided in environment.');
    }
  } else {
    // Development fallback
    adminEmail = adminEmail || 'admin@optica-luxe.com';
    adminPassword = adminPassword || 'Admin@Dev2026!';
  }

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.adminUser.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        name: env.adminName || 'Optica Luxe Administrator',
        passwordHash,
        role: 'SUPERADMIN',
      },
      create: {
        name: env.adminName || 'Optica Luxe Administrator',
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'SUPERADMIN',
      },
    });

    console.log(`✅ Seeded admin user: ${admin.email}`);
  }

  // 2. Seed Coupons (using Decimal values)
  const coupons = [
    {
      code: 'LUXE2026',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      isActive: true,
      expiryDate: new Date('2027-12-31'),
    },
    {
      code: 'OPTICA15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      isActive: true,
      expiryDate: new Date('2027-12-31'),
    },
    {
      code: 'VIP20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: true,
      expiryDate: new Date('2027-12-31'),
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${coupons.length} promotional coupons.`);

  // 3. Seed Products
  const products = [
    {
      sku: 'CRT-PNT-GLD-01',
      name: 'Cartier Panthère Imperial Gold',
      nameAr: 'كارتييه بانثير إمبيريال جولد',
      description: 'Iconic Cartier eyewear handcrafted with 18K gold plating and polarized lenses.',
      descriptionAr: 'تحفة فنية لا تتكرر من دار كارتييه العريقة. تصميم بانثير الأيقوني يجمع بين اللمعان الذهبي المترف والتفاصيل المنحوتة يدوياً بدقة متناهية، مع عدسات واقية عالية النقاء.',
      price: 4850,
      oldPrice: 5600,
      discountPercent: 13,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'luxury-frames',
      categoryAr: 'إطارات فاخرة',
      brand: 'Cartier',
      brandAr: 'كارتييه',
      stock: 8,
      shape: 'aviator',
      shapeAr: 'أفياتور كلاسيكي',
      material: 'gold-plated',
      materialAr: 'معدن مطلي بالذهب عيار 18',
      gender: 'unisex',
      genderAr: 'للجنسين',
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.95,
      reviewCount: 24,
      colors: [
        { name: '18K Yellow Gold', nameAr: 'ذهب أصفر عيار 18', code: '#D4AF37' },
        { name: 'Platinum Finish', nameAr: 'بلاتين خالص', code: '#E5E4E2' },
      ],
      dimensions: { lensWidth: 58, bridgeWidth: 16, templeLength: 140 },
    },
    {
      sku: 'GUC-GG-HAV-02',
      name: 'Gucci Horsebit Vintage Havana',
      nameAr: 'غوتشي هورسبت هافانا كلاسيك',
      description: 'Elegant oversized acetate frame featuring the iconic Gucci gold-tone horsebit.',
      descriptionAr: 'نظارة شمسية راقية من غوتشي بتصميم هافانا متدرج مزينة بشعار هورسبيت الذهبي الفاخر على الذراعين، تمنحك إطلالة ملكية وحماية كاملة من الأشعة فوق البنفسجية.',
      price: 3600,
      oldPrice: 4200,
      discountPercent: 14,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      brand: 'Gucci',
      brandAr: 'غوتشي',
      stock: 12,
      shape: 'square',
      shapeAr: 'مربع عصري',
      material: 'acetate',
      materialAr: 'أسيتات إيطالي فاخر',
      gender: 'women',
      genderAr: 'نسائي',
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 31,
      colors: [
        { name: 'Dark Havana Tortoise', nameAr: 'هافانا داكن', code: '#3E2723' },
        { name: 'Glossy Onyx Black', nameAr: 'أسود أونيكس لامع', code: '#111111' },
      ],
      dimensions: { lensWidth: 54, bridgeWidth: 18, templeLength: 145 },
    },
    {
      sku: 'PRD-SYM-BLK-03',
      name: 'Prada Symbole Geometric Titanium',
      nameAr: 'برادا سيمبول تيتانيوم هندسي',
      description: 'Ultra-lightweight titanium optical frames with sculptural geometric temples.',
      descriptionAr: 'إطار طبي متطور يجمع بين خفة التيتانيوم المذهلة والصلابة الفائقة مع لمسات دار برادا الهندسية الجريئة لتناسب أسلوب الحياة الراقي والعملي.',
      price: 4200,
      oldPrice: null,
      discountPercent: null,
      image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      brand: 'Prada',
      brandAr: 'برادا',
      stock: 10,
      shape: 'hexagonal',
      shapeAr: 'مسدس هندسي',
      material: 'titanium',
      materialAr: 'تيتانيوم ياباني فائق الخفة',
      gender: 'men',
      genderAr: 'رجالي',
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
      rating: 4.88,
      reviewCount: 19,
      colors: [
        { name: 'Matte Gunmetal', nameAr: 'رمادي بركاني مطفي', code: '#424242' },
        { name: 'Brushed Gold', nameAr: 'ذهبي مسامي', code: '#C5A059' },
      ],
      dimensions: { lensWidth: 52, bridgeWidth: 19, templeLength: 142 },
    },
    {
      sku: 'TF-FT5634-HAV-04',
      name: 'Tom Ford Private Eyewear Collection',
      nameAr: 'توم فورد برايفت كولكشن أسيتات',
      description: 'Signature Tom Ford T-logo optical frame in rich Japanese hand-polished acetate.',
      descriptionAr: 'فخامة مطلقة مستوحاة من المجموعة الخاصة للمصمم توم فورد. تفاصيل معدن التيتانيوم الأيقوني T على المفصلات تعكس الفخامة الصامتة والذوق الرفيع.',
      price: 3950,
      oldPrice: 4500,
      discountPercent: 12,
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      brand: 'Tom Ford',
      brandAr: 'توم فورد',
      stock: 15,
      shape: 'rectangle',
      shapeAr: 'مستطيل كلاسيكي',
      material: 'acetate',
      materialAr: 'أسيتات عضوي مصقول يدوياً',
      gender: 'unisex',
      genderAr: 'للجنسين',
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.92,
      reviewCount: 42,
      colors: [
        { name: 'Amber Tortoise', nameAr: 'كهرمان تورتويز', code: '#5D4037' },
        { name: 'Classic Black', nameAr: 'أسود كلاسيكي', code: '#000000' },
      ],
      dimensions: { lensWidth: 53, bridgeWidth: 17, templeLength: 145 },
    },
    {
      sku: 'RB-AV-POL-05',
      name: 'Ray-Ban Aviator Classic Polarized',
      nameAr: 'ريبان أفياتور كلاسيك مستقطبة',
      description: 'The world most iconic sunglasses model with G-15 polarized crystal lenses.',
      descriptionAr: 'النظارة الأكثر شهرة في تاريخ البصريات منذ عام 1937. إطار ذهبي نحيف مع عدسات كريستالية G-15 الخضراء المستقطبة لمنع التوهج بنسبة 100%.',
      price: 2450,
      oldPrice: 2800,
      discountPercent: 12,
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      brand: 'Ray-Ban',
      brandAr: 'ريبان',
      stock: 25,
      shape: 'aviator',
      shapeAr: 'أفياتور قطرة ماء',
      material: 'metal',
      materialAr: 'سبيكة معدنية مرنة',
      gender: 'unisex',
      genderAr: 'للجنسين',
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      rating: 4.96,
      reviewCount: 88,
      colors: [
        { name: 'Gold Frame / G-15 Green', nameAr: 'إطار ذهبي / عدسات خضراء', code: '#D4AF37' },
        { name: 'Black Frame / Polarized Grey', nameAr: 'إطار أسود / عدسات رمادية', code: '#212121' },
      ],
      dimensions: { lensWidth: 58, bridgeWidth: 14, templeLength: 135 },
    },
    {
      sku: 'CL-ACUVUE-OASYS-06',
      name: 'Acuvue Oasys with HydraLuxe (6 Lenses)',
      nameAr: 'عدسات أكيوفيو أواسيس هيدرالوكس (6 عدسات)',
      description: 'Premium daily-wear silicone hydrogel contact lenses for dry eyes.',
      descriptionAr: 'عدسات لاصقة طبية بتقنية هيدرالوكس الثورية المصممة لترطيب دائم وراحة فائقة طوال اليوم حتى أمام الشاشات الرقمية. حماية عالية من الأشعة فوق البنفسجية.',
      price: 850,
      oldPrice: 950,
      discountPercent: 10,
      image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'contact-lenses',
      categoryAr: 'عدسات لاصقة',
      brand: 'Acuvue',
      brandAr: 'أكيوفيو',
      stock: 40,
      shape: null,
      shapeAr: null,
      material: 'silicone-hydrogel',
      materialAr: 'سيليكون هيدروجيل متطور',
      gender: 'unisex',
      genderAr: 'للجنسين',
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      rating: 4.85,
      reviewCount: 16,
      colors: null,
      dimensions: null,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }

  console.log(`✅ Seeded ${products.length} luxury optical products.`);
  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
