import { Injectable, computed, signal } from '@angular/core';
import { FilterState, LensOption, Product, ProductCategory } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsSignal = signal<Product[]>([
    {
      id: 'opt-001',
      name: 'Cartier Panthère Imperial Gold',
      nameAr: 'كارتييه بانثير إمبيريال جولد',
      brand: 'Cartier',
      brandAr: 'كارتييه',
      category: 'luxury-frames',
      categoryAr: 'إطارات فاخرة',
      price: 4850,
      oldPrice: 5600,
      discountPercent: 13,
      isNew: true,
      isBestSeller: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 38,
      thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Pure Gold 18K', nameAr: 'ذهب خالص 18 قيراط', code: '#D4AF37' },
        { name: 'Rose Gold', nameAr: 'ذهب وردي فاخر', code: '#B76E79' },
        { name: 'Platinum Silver', nameAr: 'بلاتينيوم فضي', code: '#E5E4E2' },
      ],
      shape: 'aviator',
      shapeAr: 'أفياتور كلاسيكي',
      material: 'gold-plated',
      materialAr: 'معدن مطلي بالذهب عيار 18',
      gender: 'unisex',
      genderAr: 'للجنسين',
      dimensions: { lensWidth: 58, bridgeWidth: 16, templeLength: 140 },
      descriptionAr: 'تحفة فنية لا تتكرر من دار كارتييه العريقة. تصميم بانثير الأيقوني يجمع بين اللمعان الذهبي المترف والتفاصيل المنحوتة يدوياً بدقة متناهية، مع عدسات واقية عالية النقاء.',
      storyAr: 'تجسد هذه النظارة الفخامة المطلقة بنقوش الفهد الأسطورية وتلميع يدوي يستغرق أكثر من 60 ساعة عمل حرفي في ورش باريس.',
      featuresAr: [
        'طلاء ذهبي عيار 18 قيراط مقاوم للخدش والتآكل',
        'عدسات شمسية مستقطبة مع طبقة مضادة للانعكاسات المزدوجة',
        'وسادات أنف سيليكون طبي مريحة لا تترك أثراً',
        'علبة جلدية فاخرة مرقمة مع شهادة الأصالة الدولية',
      ],
      inStock: true,
      sku: 'CRT-PNT-GLD-01',
    },
    {
      id: 'opt-002',
      name: 'Tom Ford FT0237 Snowdon Italian Acetate',
      nameAr: 'توم فورد سنودون أسيتات إيطالي',
      brand: 'Tom Ford',
      brandAr: 'توم فورد',
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      price: 1950,
      oldPrice: 2300,
      discountPercent: 15,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 94,
      thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Dark Havana', nameAr: 'هافانا داكن (تورتويز)', code: '#3E2723' },
        { name: 'Obsidian Black', nameAr: 'أسود فحمي ملكي', code: '#121212' },
        { name: 'Cognac Amber', nameAr: 'عنبري دافئ', code: '#795548' },
      ],
      shape: 'square',
      shapeAr: 'مربع كلاسيكي',
      material: 'acetate',
      materialAr: 'أسيتات إيطالي مقطوع يدوياً',
      gender: 'men',
      genderAr: 'رجالي',
      dimensions: { lensWidth: 52, bridgeWidth: 20, templeLength: 145 },
      descriptionAr: 'النظارة الشهيرة التي ظهرت في أفلام جيمس بوند. تتميز بتوقيع حرف T الأيقوني المعدني على الجوانب، وهيكل من الأسيتات الإيطالي الكثيف لمتانة استثنائية وأناقة رجالية لا تخطئها العين.',
      storyAr: 'صنعت في إيطاليا باستخدام أجود خامات الأسيتات العضوي، وتم صقلها على مرحلتين للحصول على لمعان زجاجي فائق يدوم طويلاً.',
      featuresAr: [
        'توقيع حرف T الشهير بلون الذهب الوردي',
        'عدسات زجاجية حماية كاملة 100% UV400',
        'مفصلات مرنة معززة بـ 5 نتوءات لمتانة مدى الحياة',
        'متوافقة مع تركيب العدسات الطبية',
      ],
      inStock: true,
      sku: 'TF-SND-0237',
    },
    {
      id: 'opt-003',
      name: 'Lindberg Titanium Air Rim Minimalist',
      nameAr: 'ليندبيرغ إير ريم تيتانيوم طبي',
      brand: 'Lindberg',
      brandAr: 'ليندبيرغ الدنماركية',
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      price: 3200,
      oldPrice: 3500,
      discountPercent: 8,
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 42,
      thumbnail: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1509695503492-413bc6d0a63a?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Brushed Titanium', nameAr: 'تيتانيوم رمادي مصقول', code: '#78909C' },
        { name: 'Midnight Blue', nameAr: 'أزرق ليلي فاخر', code: '#1A237E' },
        { name: 'Matte Champagne', nameAr: 'شامبين مطفي', code: '#CFB53B' },
      ],
      shape: 'round',
      shapeAr: 'دائري نيوكلاسيك',
      material: 'titanium',
      materialAr: 'تيتانيوم نقي 100% خالي من المسامير',
      gender: 'unisex',
      genderAr: 'للجنسين',
      dimensions: { lensWidth: 49, bridgeWidth: 21, templeLength: 145 },
      descriptionAr: 'قمة الهندسة الدنماركية في عالم البصريات. وزن لا يتعدى 2.8 غرام، بدون أي مسامير أو لحام تقليدي. راحة لا تضاهى طوال اليوم تناسب رجال وسيدات الأعمال الباحثين عن التميز الهادئ.',
      storyAr: 'حائزة على عشرات جوائز التصميم العالمية، توفر المرونة الفائقة والراحة القصوى للأشخاص الذين يرتدون النظارات لساعات طويلة.',
      featuresAr: [
        'خفيفة كالريشة بوزن 2.8 غرام فقط',
        'تيتانيوم طبي لا يسبب أي حساسية للبشرة',
        'تصميم ذكي بدون مسامير لتجنب التفكك والارتخاء',
        'وسادات طبية مضادة للانزلاق من السيليكون الدنماركي',
      ],
      inStock: true,
      sku: 'LND-AIR-TM-49',
    },
    {
      id: 'opt-004',
      name: 'Gucci Horsebit Geometric Gradient',
      nameAr: 'غوتشي هورسبت هندسية متدرجة',
      brand: 'Gucci',
      brandAr: 'غوتشي',
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      price: 2450,
      oldPrice: 2890,
      discountPercent: 15,
      isNew: true,
      isBestSeller: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 61,
      thumbnail: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Glossy Black Gold', nameAr: 'أسود لامع مع شعار ذهبي', code: '#000000' },
        { name: 'Opal Ivory', nameAr: 'عاجي أوبال مميز', code: '#FFFFF0' },
        { name: 'Tortoiseshell Bronze', nameAr: 'صدف السلحفاة برونزي', code: '#5D4037' },
      ],
      shape: 'hexagonal',
      shapeAr: 'سداسي هندسي عصري',
      material: 'acetate',
      materialAr: 'أسيتات لامع فائق الجودة',
      gender: 'women',
      genderAr: 'نسائي',
      dimensions: { lensWidth: 55, bridgeWidth: 18, templeLength: 140 },
      descriptionAr: 'تصميم جريء ومفعم بالأنوثة الطاغية من غوتشي. إطار هندسي فريد مع شعار لجام الحصان الشهير بالذهب البراق وعدسات متدرجة تضفي هالة من الغموض والجاذبية.',
      storyAr: 'مستوحاة من أزياء حقبة السبعينيات الإيطالية مع لمسة عصرية تعكس أحدث اتجاهات منصات عروض ميلانو.',
      featuresAr: [
        'رمز لجام الحصان Horsebit المميز منقوش يدوياً',
        'عدسات متدرجة بدرجات البني العسلي والرمادي الداكن',
        'حماية قصوى من الأشعة فوق البنفسجية UV400',
        'علبة مخملية ملونة مستوحاة من صالونات فلورنسا',
      ],
      inStock: true,
      sku: 'GCC-HRS-HEX-04',
    },
    {
      id: 'opt-005',
      name: 'Prada Linea Rossa Ultralight Sport',
      nameAr: 'برادا لينيا روسا رياضية فائقة الخفة',
      brand: 'Prada',
      brandAr: 'برادا',
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      price: 1650,
      oldPrice: 1950,
      discountPercent: 15,
      isNew: false,
      isBestSeller: true,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 78,
      thumbnail: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Matte Graphite', nameAr: 'جرافيت مطفي رياضي', code: '#424242' },
        { name: 'Carbon Black', nameAr: 'أسود كربوني', code: '#212121' },
      ],
      shape: 'rectangle',
      shapeAr: 'مستطيل ديناميكي',
      material: 'carbon-fiber',
      materialAr: 'ألياف كربونية مركبة',
      gender: 'men',
      genderAr: 'رجالي',
      dimensions: { lensWidth: 59, bridgeWidth: 15, templeLength: 145 },
      descriptionAr: 'أداء رياضي عالي المستوى مع لمسة الفخامة الإيطالية المميزة لخط لينيا روسا. عدسات مستقطبة تحجب الوهج بالكامل أثناء القيادة والأنشطة الخارجية.',
      storyAr: 'صممت خصيصاً للمغامرين ورياضيي الإبحار والقيادة السريعة، وتجمع بين خفة الوزن والصلابة الفائقة.',
      featuresAr: [
        'شريط برادا الأحمر الأيقوني على الذراعين',
        'عدسات بولارايزد مستقطبة عالية التباين تمنع وهج الشمس',
        'طلاء هيدروفوبيك طارد للماء والزيوت',
        'مقاومة فائقة للصدمات والحرارة',
      ],
      inStock: true,
      sku: 'PRD-LNR-SPT-05',
    },
    {
      id: 'opt-006',
      name: 'Oliver Peoples Gregory Peck Vintage Acetate',
      nameAr: 'أوليفر بيبولز غريغوري بيك كلاسيك',
      brand: 'Oliver Peoples',
      brandAr: 'أوليفر بيبولز',
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      price: 2100,
      oldPrice: 2400,
      discountPercent: 12,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 52,
      thumbnail: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Raintree Tortoise', nameAr: 'تورتويز كلاسيكي عتيق', code: '#4E342E' },
        { name: 'Buff Honey Crystal', nameAr: 'عسلي بلوري شفاف', code: '#D7CCC8' },
        { name: 'Semi-Matte Black', nameAr: 'أسود نصف مطفي', code: '#263238' },
      ],
      shape: 'round',
      shapeAr: 'دائري ريترو مع جسر مفتاح',
      material: 'acetate',
      materialAr: 'أسيتات عضوي مخصص مصنع في اليابان',
      gender: 'unisex',
      genderAr: 'للجنسين',
      dimensions: { lensWidth: 47, bridgeWidth: 23, templeLength: 150 },
      descriptionAr: 'تصميم أيقوني مستوحى من النظارة التي ارتداها الممثل الأسطوري غريغوري بيك في فيلمه الحائز على الأوسكار. جسر بنمط ثقب المفتاح وتفاصيل كلاسيكية لا تزول مع الزمن.',
      storyAr: 'بالتعاون الرسمي مع مؤسسة غريغوري بيك، تم إحياء هذا التصميم ليظل رمزاً للذكاء والوقار الكلاسيكي.',
      featuresAr: [
        'جسر ثقب المفتاح الأيقوني لتوزيع مثالي للوزن على الأنف',
        'مفصلات عتيقة مثبتة يدوياً بمسامير حقيقية',
        'حفر داخلي بالليزر يحمل توقيع الماركة',
        'مثالية لعدسات الحماية من الشاشات الزرقاء والعدسات التقدمية',
      ],
      inStock: true,
      sku: 'OP-GP-RT-06',
    },
    {
      id: 'opt-007',
      name: 'Saint Laurent Cat-Eye Couture Noir',
      nameAr: 'سان لوران عين القطة كوتور أسود',
      brand: 'Saint Laurent',
      brandAr: 'سان لوران باريس',
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      price: 2300,
      oldPrice: 2700,
      discountPercent: 14,
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 39,
      thumbnail: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Ultra Deep Black', nameAr: 'أسود باريسي شديد السواد', code: '#0A0A0A' },
        { name: 'Marble Havana', nameAr: 'رخامي هافانا ملكي', code: '#543D2B' },
      ],
      shape: 'cat-eye',
      shapeAr: 'عين القطة الجريئة',
      material: 'acetate',
      materialAr: 'أسيتات فرنسي عالي الكثافة',
      gender: 'women',
      genderAr: 'نسائي',
      dimensions: { lensWidth: 53, bridgeWidth: 19, templeLength: 145 },
      descriptionAr: 'تعبير نقي عن البذخ والغموض الباريسي. زوايا حادة مرفوعة ترفع ملامح الوجه وتضفي حضوراً لافتاً، مع شعار سان لوران الأنيق المحفور على الأذرع.',
      storyAr: 'تعتبر هذه النظارة القطعة المفضلة لنجمات الموضة العالميات في أسبوع الموضة بباريس هذا العام.',
      featuresAr: [
        'إطار سميك مفرز بدقة نحتية ثلاثية الأبعاد',
        'عدسات رمادية داكنة فئة 3 لحماية مطلقة من وهج الشمس',
        'شعار Saint Laurent محفور بلون ذهبي ناعم',
        'حماية شاملة UV400 مع ضمان دولي أصلي',
      ],
      inStock: true,
      sku: 'SL-CTE-07',
    },
    {
      id: 'opt-008',
      name: 'Persol 714 Steve McQueen Folding Limited Edition',
      nameAr: 'بيرسول 714 ستيف ماكوين القابلة للطي',
      brand: 'Persol',
      brandAr: 'بيرسول',
      category: 'sunglasses',
      categoryAr: 'نظارات شمسية',
      price: 2800,
      oldPrice: 3200,
      discountPercent: 12,
      isNew: true,
      isBestSeller: true,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 110,
      thumbnail: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Light Havana & Blue Lens', nameAr: 'هافانا فاتح مع عدسات زرقاء زجاجية', code: '#8D6E63' },
        { name: 'Classic Black', nameAr: 'أسود لامع إيطالي', code: '#1B1B1B' },
      ],
      shape: 'aviator',
      shapeAr: 'بايلوت قابل للطي بنظام مبتكر',
      material: 'acetate',
      materialAr: 'أسيتات إيطالي ونظام طي من الفولاذ المقاوم للصدأ',
      gender: 'men',
      genderAr: 'رجالي',
      dimensions: { lensWidth: 54, bridgeWidth: 21, templeLength: 140 },
      descriptionAr: 'أول نظارة شمسية قابلة للطي في التاريخ. نظام ميفليكتو Meflecto الحصري لتعديل الضغط على الرأس، ومفصلات طي دقيقة تسمح بوضعها بسهولة داخل الجيب الداخلي للسترة.',
      storyAr: 'النسخة التاريخية الأصلية التي خلدها أسطورة السينما ستيف ماكوين في فيلم The Thomas Crown Affair.',
      featuresAr: [
        'نظام طي ميكانيكي عبقري يتكون من 10 خطوات طي سلسة',
        'عدسات كريستالية زجاجية حقيقية بلون أزرق بحري استثنائي',
        'نظام Meflecto المسجل لمرونة وتكيف الذراعين تلقائياً',
        'سهم Persol الفضي الأيقوني Supreme Arrow',
      ],
      inStock: true,
      sku: 'PRS-714-SMQ-08',
    },
    {
      id: 'opt-009',
      name: 'Acuvue Oasys with HydraLuxe Daily Lenses',
      nameAr: 'أكيوفيو أويسيس هيدرالوكس عدسات يومية',
      brand: 'Acuvue',
      brandAr: 'أكيوفيو جونسون آند جونسون',
      category: 'contact-lenses',
      categoryAr: 'عدسات لاصقة',
      price: 320,
      oldPrice: 380,
      discountPercent: 15,
      isNew: false,
      isBestSeller: true,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 142,
      thumbnail: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Clear Vision', nameAr: 'شفاف طبي نقي', code: '#E0F7FA' },
      ],
      shape: 'round',
      shapeAr: 'تصميم هيدروجيل ميكرو-دقيق',
      material: 'metal',
      materialAr: 'سيليكون هيدروجيل مشبع بالرطوبة',
      gender: 'unisex',
      genderAr: 'للجنسين',
      dimensions: { lensWidth: 14, bridgeWidth: 8, templeLength: 0 },
      descriptionAr: 'عدسات لاصقة يومية فائقة الترطيب مع تقنية هيدرالوكس الشبيهة بالدموع الطبيعية. توفر راحة تامة طوال 16 ساعة متواصلة حتى أمام الشاشات الرقمية والأجواء الجافة.',
      storyAr: 'الخيار الأول المعتمد من قبل استشاريي طب العيون لحماية القرنية وتوفير أقصى نفاذية للأكسجين.',
      featuresAr: [
        'تقنية هيدرالوكس لترطيب مستمر ومحاكاة غشاء الدموع',
        'حماية فئة 1 من الأشعة فوق البنفسجية UV بنسبة 99%',
        'عبوة 30 عدسة للاستخدام اليومي بدون الحاجة لمحفظة أو معقم',
        'رؤية فائقة الوضوح تقلل من تعب العين وإجهاد الشاشات',
      ],
      inStock: true,
      sku: 'ACV-OAS-DAY-30',
    },
    {
      id: 'opt-010',
      name: 'Anesthesia Luminous Colored Aesthetic Lenses',
      nameAr: 'أنستازيا لومينوس عدسات تجميلية ملونة',
      brand: 'Anesthesia',
      brandAr: 'أنستازيا لاكشري',
      category: 'contact-lenses',
      categoryAr: 'عدسات لاصقة',
      price: 290,
      oldPrice: 350,
      discountPercent: 17,
      isNew: true,
      isBestSeller: true,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 88,
      thumbnail: 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1563903530908-afdd155d057a?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Hazel Dream', nameAr: 'عسلي حالم طبيعي', code: '#BCAAA4' },
        { name: 'Gray Velvet', nameAr: 'رمادي مخملي ساحر', code: '#B0BEC5' },
        { name: 'Emerald Green', nameAr: 'زمردي أخضر راقي', code: '#81C784' },
      ],
      shape: 'round',
      shapeAr: 'حواف ناعمة بدون حلقة خارجية حادة',
      material: 'metal',
      materialAr: 'بوليمر طبي متوافق حيوياً',
      gender: 'women',
      genderAr: 'نسائي',
      dimensions: { lensWidth: 14, bridgeWidth: 8, templeLength: 0 },
      descriptionAr: 'عدسات تجميلية فاخرة تمنح العينين لوناً آسراً ومظهراً طبيعياً خلاباً دون أي تصنع. صممت بتقنية صباغة الساندويتش الآمنة كلياً لضمان عدم ملامسة اللون لسطح العين.',
      storyAr: 'المفضلة لخبراء المكياج والجمال في الخليج العربي والشرق الأوسط للمناسبات الراقية والإطلالات اليومية.',
      featuresAr: [
        'تقنية الألوان المجهرية المدمجة ثلاثية الأبعاد',
        'مرخصة طبياً من هيئة الغذاء والدواء السعودية والأمريكية FDA',
        'صلاحية استخدام مريحة لمدة 6 أشهر مع المحلول الطبي المرفق',
        'ترطيب عالي يمنع الاحمرار وجفاف العين',
      ],
      inStock: true,
      sku: 'ANS-LUM-CLR-10',
    },
    {
      id: 'opt-011',
      name: 'Silhouette Titan Minimal Art The Icon',
      nameAr: 'سيلويت تيتان مينيمل آرت النمساوية',
      brand: 'Silhouette',
      brandAr: 'سيلويت النمسا',
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      price: 2750,
      oldPrice: 3100,
      discountPercent: 11,
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 31,
      thumbnail: 'https://images.unsplash.com/photo-1509695503492-413bc6d0a63a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1509695503492-413bc6d0a63a?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Cosmic Gold', nameAr: 'ذهبي كوزميك ناعم', code: '#E6C894' },
        { name: 'Titan Gunmetal', nameAr: 'تيتانيوم أسود مطفي', code: '#37474F' },
      ],
      shape: 'round',
      shapeAr: 'بدون إطار (ريملس) دائري أنيق',
      material: 'titanium',
      materialAr: 'تيتانيوم نمساوي مفرغ عالي المرونة',
      gender: 'unisex',
      genderAr: 'للجنسين',
      dimensions: { lensWidth: 51, bridgeWidth: 19, templeLength: 145 },
      descriptionAr: 'النظارة التي اختارتها وكالة ناسا للفضاء الفضائي لخفة وزنها الفائقة وموثوقيتها. تصميم Rimless بدون إطار خارجي يمنح مجال رؤية بانورامي غير محدود وخفة لا تصدق.',
      storyAr: 'صنعت في لينتس بالنمسا بحرفية دقيقة تلغي كل ما هو غير ضروري لتركز على صفاء الرؤية وخفة الحضور.',
      featuresAr: [
        'معتمدة رسمياً لرحلات الفضاء الدولية',
        'وزن لا يتجاوز 1.8 غرام بدون عدسات',
        'تثبيت العدسات بتقنية كبس مبتكرة خالية من البراغي',
        'مقاومة فائقة للانحناء واستعادة الشكل الأصلي فوراً',
      ],
      inStock: true,
      sku: 'SLH-TMA-AT-11',
    },
    {
      id: 'opt-012',
      name: 'Leather Optical Atelier Travel Case & Care Set',
      nameAr: 'حقيبة أوبتيكا الجلدية الفاخرة ومجموعة العناية',
      brand: 'Optica Atelier',
      brandAr: 'أوبتيكا أتلييه',
      category: 'accessories',
      categoryAr: 'إكسسوارات',
      price: 490,
      oldPrice: 650,
      discountPercent: 24,
      isNew: true,
      isBestSeller: true,
      isFeatured: false,
      rating: 5.0,
      reviewCount: 47,
      thumbnail: 'https://images.unsplash.com/photo-1614715838608-dd527c46131d?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1614715838608-dd527c46131d?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
      ],
      colors: [
        { name: 'Cognac Saddle Leather', nameAr: 'جلد طبيعي بني كونياك', code: '#5D4037' },
        { name: 'Onyx Black', nameAr: 'جلد أسود مذهب الحواف', code: '#212121' },
      ],
      shape: 'rectangle',
      shapeAr: 'حقيبة سفر صلبة تتسع لـ 3 نظارات',
      material: 'acetate',
      materialAr: 'جلد إيطالي طبيعي مدبوغ نباتياً ومخمل سويسري',
      gender: 'unisex',
      genderAr: 'للجنسين',
      dimensions: { lensWidth: 0, bridgeWidth: 0, templeLength: 0 },
      descriptionAr: 'مجموعة فاخرة متكاملة لحفظ وحماية نظاراتك أثناء السفر والتنقل. تتضمن حافظة صلبة من الجلد الطبيعي المدبوغ يدوياً، مع بخاخ تنظيف نانو فائق النقاوة، ومفتاح صيانة صغير، وقطعتين من أقمشة المايكروفايبر فائقة الكثافة.',
      storyAr: 'صنعت يدوياً في إيطاليا لعشاق النظارات الفاخرة الذين يرغبون في الحفاظ على بريق مقتنياتهم الثمينة.',
      featuresAr: [
        'جلد طبيعي إيطالي 100% يزداد بهاءً بمرور الوقت',
        'بطانة داخلية من المخمل السويسري الناعم ضد الخدش',
        'بخاخ تنظيف نانوي معقم خالي من الكحول والمواد الكاشطة',
        'مفك دقيق لضبط المسامير وقطع أقمشة تنظيف حريرية',
      ],
      inStock: true,
      sku: 'OPT-LTC-SET-12',
    },
  ]);

  readonly lensOptions: LensOption[] = [
    {
      id: 'lens-std',
      name: 'Standard UV400 Polarized',
      nameAr: 'عدسات شمسية مستقطبة UV400 معيارية',
      price: 0,
      descriptionAr: 'عدسات حماية كاملة من أشعة الشمس والأشعة فوق البنفسجية، مضمنة مجاناً مع الإطار.',
    },
    {
      id: 'lens-blue',
      name: 'Blue Light Digital Shield 1.60',
      nameAr: 'عدسات حماية رقمية من الضوء الأزرق (Blue Block)',
      price: 350,
      descriptionAr: 'طبقة متطورة تحجب الإشعاع الأزرق الضار المنبعث من شاشات الهواتف والكمبيوتر لمنع إجهاد العين والصداع.',
    },
    {
      id: 'lens-thin',
      name: 'Ultra-Thin Hi-Index 1.67 Anti-Reflective',
      nameAr: 'عدسات مضغوطة نحيفة جداً 1.67 فائقة الصفاء',
      price: 650,
      descriptionAr: 'عدسات ألمانية خفيفة مضغوطة بنسبة 40%، مقاومة للانعكاسات، والخدوش، والتبخر والزيوت.',
    },
    {
      id: 'lens-photo',
      name: 'Transitions Signature Gen 8 (Photochromic)',
      nameAr: 'عدسات ترانزيشنز الذكية (تتحول لشمسية تلقائياً)',
      price: 850,
      descriptionAr: 'تتكيف بذكاء مع الإضاءة: شفافة تماماً في الأماكن المغلقة، وتتحول إلى شمسية داكنة تحت أشعة الشمس.',
    },
  ];

  // Expose signals
  readonly products = this.productsSignal.asReadonly();

  readonly bestSellers = computed(() =>
    this.productsSignal().filter((p) => p.isBestSeller)
  );

  readonly newArrivals = computed(() =>
    this.productsSignal().filter((p) => p.isNew)
  );

  readonly featuredProducts = computed(() =>
    this.productsSignal().filter((p) => p.isFeatured)
  );

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === id);
  }

  getRelatedProducts(productId: string, limit = 4): Product[] {
    const current = this.getProductById(productId);
    if (!current) return this.productsSignal().slice(0, limit);

    const matches = this.productsSignal().filter(
      (p) => p.id !== productId && (p.category === current.category || p.brand === current.brand)
    );

    if (matches.length >= limit) {
      return matches.slice(0, limit);
    }

    const others = this.productsSignal().filter(
      (p) => p.id !== productId && !matches.some((m) => m.id === p.id)
    );

    return [...matches, ...others].slice(0, limit);
  }

  filterProducts(filters: FilterState): Product[] {
    let result = [...this.productsSignal()];

    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.brand && filters.brand !== 'all') {
      result = result.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
    }

    if (filters.shape && filters.shape !== 'all') {
      result = result.filter((p) => p.shape === filters.shape);
    }

    if (filters.material && filters.material !== 'all') {
      result = result.filter((p) => p.material === filters.material);
    }

    if (filters.gender && filters.gender !== 'all') {
      result = result.filter((p) => p.gender === filters.gender || p.gender === 'unisex');
    }

    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.onlyDiscounted) {
      result = result.filter((p) => (p.discountPercent || 0) > 0);
    }

    if (filters.onlyNew) {
      result = result.filter((p) => p.isNew);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.brandAr.includes(q) ||
          p.categoryAr.includes(q) ||
          p.shapeAr.includes(q)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }

  getAllBrands(): { name: string; nameAr: string; count: number }[] {
    const counts = new Map<string, { name: string; nameAr: string; count: number }>();
    for (const p of this.productsSignal()) {
      const existing = counts.get(p.brand);
      if (existing) {
        existing.count++;
      } else {
        counts.set(p.brand, { name: p.brand, nameAr: p.brandAr, count: 1 });
      }
    }
    return Array.from(counts.values());
  }
}

