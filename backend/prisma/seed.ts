import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Optica Luxe database seed...');

  // 1. Seed Admin User
  const adminEmail = env.adminDefault.email.toLowerCase();
  const passwordHash = await bcrypt.hash(env.adminDefault.password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: env.adminDefault.name,
      passwordHash,
      role: 'SUPERADMIN',
    },
    create: {
      name: env.adminDefault.name,
      email: adminEmail,
      passwordHash,
      role: 'SUPERADMIN',
    },
  });

  console.log(`✅ Seeded admin user: ${admin.email}`);

  // 2. Seed Coupons
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
      rating: 4.9,
      reviewCount: 38,
      colors: [
        { name: 'Pure Gold 18K', nameAr: 'ذهب خالص 18 قيراط', code: '#D4AF37' },
        { name: 'Rose Gold', nameAr: 'ذهب وردي فاخر', code: '#B76E79' },
      ],
      dimensions: { lensWidth: 58, bridgeWidth: 16, templeLength: 140 },
    },
    {
      sku: 'TF-SND-0237',
      name: 'Tom Ford FT0237 Snowdon Italian Acetate',
      nameAr: 'توم فورد سنودون أسيتات إيطالي',
      description: 'Iconic James Bond eyewear in heavy Italian acetate with signature T logo.',
      descriptionAr: 'النظارة الشهيرة التي ظهرت في أفلام جيمس بوند. تتميز بتوقيع حرف T الأيقوني المعدني على الجوانب، وهيكل من الأسيتات الإيطالي الكثيف لمتانة استثنائية.',
      price: 1950,
      oldPrice: 2300,
      discountPercent: 15,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      brand: 'Tom Ford',
      brandAr: 'توم فورد',
      stock: 14,
      shape: 'square',
      shapeAr: 'مربع كلاسيكي',
      material: 'acetate',
      materialAr: 'أسيتات إيطالي مقطوع يدوياً',
      gender: 'men',
      genderAr: 'رجالي',
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 94,
      colors: [
        { name: 'Dark Havana', nameAr: 'هافانا داكن (تورتويز)', code: '#3E2723' },
        { name: 'Obsidian Black', nameAr: 'أسود فحمي ملكي', code: '#121212' },
      ],
      dimensions: { lensWidth: 52, bridgeWidth: 20, templeLength: 145 },
    },
    {
      sku: 'LND-AIR-TM-49',
      name: 'Lindberg Titanium Air Rim Minimalist',
      nameAr: 'ليندبيرغ إير ريم تيتانيوم طبي',
      description: 'Danish engineering masterpiece. Featherlight 2.8g pure medical titanium without screws.',
      descriptionAr: 'قمة الهندسة الدنماركية في عالم البصريات. وزن لا يتعدى 2.8 غرام، بدون أي مسامير أو لحام تقليدي. راحة لا تضاهى طوال اليوم.',
      price: 3200,
      oldPrice: 3500,
      discountPercent: 8,
      image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      brand: 'Lindberg',
      brandAr: 'ليندبيرغ الدنماركية',
      stock: 5,
      shape: 'round',
      shapeAr: 'دائري نيوكلاسيك',
      material: 'titanium',
      materialAr: 'تيتانيوم نقي 100% خالي من المسامير',
      gender: 'unisex',
      genderAr: 'للجنسين',
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
      rating: 5.0,
      reviewCount: 42,
      colors: [
        { name: 'Brushed Titanium', nameAr: 'تيتانيوم رمادي مصقول', code: '#78909C' },
      ],
      dimensions: { lensWidth: 49, bridgeWidth: 21, templeLength: 145 },
    },
    {
      sku: 'GCC-HRS-HEX-04',
      name: 'Gucci Horsebit Geometric Gradient',
      nameAr: 'غوتشي هورسبت هندسية متدرجة',
      description: 'Bold feminine Italian design with sculpted gold horsebit icon and gradient UV400 lenses.',
      descriptionAr: 'تصميم جريء ومفعم بالأنوثة الطاغية من غوتشي. إطار هندسي فريد مع شعار لجام الحصان الشهير بالذهب البراق.',
      price: 2450,
      oldPrice: 2890,
      discountPercent: 15,
      image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      brand: 'Gucci',
      brandAr: 'غوتشي',
      stock: 10,
      shape: 'hexagonal',
      shapeAr: 'سداسي هندسي عصري',
      material: 'acetate',
      materialAr: 'أسيتات لامع فائق الجودة',
      gender: 'women',
      genderAr: 'نسائي',
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 61,
      colors: [
        { name: 'Glossy Black Gold', nameAr: 'أسود لامع مع شعار ذهبي', code: '#000000' },
      ],
      dimensions: { lensWidth: 55, bridgeWidth: 18, templeLength: 140 },
    },
    {
      sku: 'PRD-LNR-SPT-05',
      name: 'Prada Linea Rossa Ultralight Sport',
      nameAr: 'برادا لينيا روسا رياضية فائقة الخفة',
      description: 'Sport performance meets luxury. Polarized high-contrast lenses with composite carbon fiber.',
      descriptionAr: 'أداء رياضي عالي المستوى مع لمسة الفخامة الإيطالية المميزة لخط لينيا روسا. عدسات مستقطبة تحجب الوهج بالكامل.',
      price: 1650,
      oldPrice: 1950,
      discountPercent: 15,
      image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      brand: 'Prada',
      brandAr: 'برادا',
      stock: 12,
      shape: 'rectangle',
      shapeAr: 'مستطيل ديناميكي',
      material: 'carbon-fiber',
      materialAr: 'ألياف كربونية مركبة',
      gender: 'men',
      genderAr: 'رجالي',
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 78,
      colors: [
        { name: 'Matte Graphite', nameAr: 'جرافيت مطفي رياضي', code: '#424242' },
      ],
      dimensions: { lensWidth: 59, bridgeWidth: 15, templeLength: 145 },
    },
    {
      sku: 'OP-GP-RT-06',
      name: 'Oliver Peoples Gregory Peck Vintage Acetate',
      nameAr: 'أوليفر بيبولز غريغوري بيك كلاسيك',
      description: 'Timeless retro keyhole bridge optical eyewear inspired by Gregory Peck.',
      descriptionAr: 'تصميم أيقوني مستوحى من النظارة التي ارتداها الممثل الأسطوري غريغوري بيك. جسر بنمط ثقب المفتاح وتفاصيل كلاسيكية لا تزول مع الزمن.',
      price: 2100,
      oldPrice: 2400,
      discountPercent: 12,
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
      ],
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      brand: 'Oliver Peoples',
      brandAr: 'أوليفر بيبولز',
      stock: 9,
      shape: 'round',
      shapeAr: 'دائري ريترو مع جسر مفتاح',
      material: 'acetate',
      materialAr: 'أسيتات عضوي مخصص مصنع في اليابان',
      gender: 'unisex',
      genderAr: 'للجنسين',
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 52,
      colors: [
        { name: 'Raintree Tortoise', nameAr: 'تورتويز كلاسيكي عتيق', code: '#4E342E' },
      ],
      dimensions: { lensWidth: 47, bridgeWidth: 23, templeLength: 150 },
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }
  console.log(`✅ Seeded ${products.length} products.`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
