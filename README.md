# أوبتيكا لاكشري | Optica Luxe — Full-Stack E-Commerce & Order Management System

[![Angular](https://img.shields.io/badge/Angular-22-DD0031.svg?logo=angular)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18.svg?logo=vitest)](https://vitest.dev/)

**Optica Luxe (أوبتيكا لاكشري)** هو مشروع متكامل من الدرجة الأولى (Full-Stack E-commerce & Admin Operations) مصمم كمعرض أعمال تقني فائق الجودة لـ **Zentrix**. يجمع المشروع بين واجهة متجر فاخرة للبصريات والنظارات العالمية مدعومة بالكامل باللغة العربية مع دعم RTL وتصميم نخبوي (Off-white, Gold, Black, Beige)، وخلفية برمجية متطورة مبنية بـ Node.js, Express, TypeScript, PostgreSQL, و Prisma ORM، مع نظام حقيقي لإدارة الطلبات ولوحة تحكم إدارية احترافية.

---

## 🌟 ميزات النظام الرئيسية (Key Features)

### 1. واجهة المتجر النخبوية (Customer Storefront)
- **تصميم فاخر متكامل:** تجربة بصرية راقية للنظارات الشمسية، النظارات الطبية، العدسات اللاصقة، والإكسسوارات.
- **دعم كامل للغة العربية والاتجاه من اليمين لليسار (RTL):** خطوط عربية أنيقة مع تناسق كامل.
- **العملة الرسمية:** الجنيه المصري (**EGP / ج.م**).
- **محرك تصفية وفرز متقدم:** فلترة حسب الفئة، الماركة، السعر، وشكل الإطار، مع ترتيب حسب السعر والأكثر طلباً.
- **عربة تسوق متطورة ومقتنيات مفضلة:** حفظ محلي متزامن وتحديث لحظي للكميات.
- **نافذة عرض سريع (Quick View Modal) وبحث فوري:** استعراض سريع لمواصفات النظارة وألوانها.

### 2. تدفق إتمام الطلبات الحقيقي (Server-Validated Checkout)
- **عدم الوثوق بالواجهة الأمامية مطلقا:** الأسعار والمجاميع وقيمة الخصم تُحسب وتُدقق بالكامل على الخادم من قاعدة البيانات.
- **معاملات ذرية في قاعدة البيانات (Transactional Creation):** إنشاء سجل الطلب وسجلات عناصر الطلب وحجز المخزون داخل `transaction`.
- **أرقام طلبات فريدة وتسلسلية:** توليد أرقام بنمط رسمي مثل `OPT-2026-00001`.
- **نظام كوبونات ذكي:** دعم الخصم بالنسبة المئوية (%) أو المبالغ الثابتة (ج.م) مع تدقيق الصلاحية وتاريخ الانتهاء.
- **طرق دفع تجريبية آمنة (Demo Payment Methods):** الدفع عند الاستلام، بطاقة تجريبية، انستاباي تجريبي، وفودافون كاش مع مؤشرات توضيحية.

### 3. لوحة تحكم الإدارة (Admin Dashboard & Operations)
- **لوحة مؤشرات تفاعلية (KPIs & Metrics):** إجمالي المبيعات، الطلبات الجديدة، الطلبات المكتملة، حجم المخزون، ورسوم بيانية لتوزيع الحالات واتجاه المبيعات.
- **إدارة كاملة للطلبات (Orders Management):** بحث وتصفية برقم الطلب، اسم العميل، الهاتف، وتحديث حالات الشحن والتحصيل في الوقت الفعلي.
- **إدارة الكتالوج والمخزون (Products & Inventory):** إضافة وتعديل وحذف المنتجات، مع ضبط سريع للمخزون (+ / -).
- **إدارة الكوبونات (Coupons Management):** إنشاء أكواد العروض، تحديد قيم الخصم، وتفعيل/تعطيل الكوبونات بضغطة زر.
- **حماية أمنية صارمة:** مصادقة JWT، تشفير كلمات المرور بـ bcrypt، حماية المسارات بـ Angular Route Guards و HTTP Interceptors، وتحديد معدل الطلبات (Rate Limiting).

---

## 🏗️ المعمارية التقنية (System Architecture)

```
optica-luxe/
├── backend/                        # خادم التطبيق الخلفي (Node.js + Express + TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma           # نموذج قاعدة بيانات PostgreSQL والعلاقات
│   │   ├── seed.ts                 # سكريبت زرع البيانات التجريبية
│   │   └── migrations/             # ترحيلات الـ DDL الرسمية
│   ├── src/
│   │   ├── config/env.ts           # إعدادات المتغيرات البيئية وفحصها
│   │   ├── controllers/            # متحكمات الـ REST API
│   │   ├── services/               # منطق الأعمال والحسابات المالية
│   │   ├── routes/                 # توجيهات الـ API
│   │   ├── middleware/             # الحماية، التحقق، الـ Auth والـ Rate Limiting
│   │   ├── database/prisma.ts      # عميل Prisma ومحرك التخزين الصامد
│   │   └── validators/             # مخططات التحقق بـ Zod
│   └── tests/                      # اختبارات تكامل الـ API بـ Vitest و Supertest
│
├── src/                            # واجهة المستخدم الأمامية (Angular 22)
│   ├── app/
│   │   ├── core/                   # الخدمات الأساسية، الاعتراضات والحراس
│   │   │   ├── guards/             # admin-auth.guard.ts
│   │   │   ├── interceptors/       # auth.interceptor.ts
│   │   │   └── services/           # order-api, admin-auth, products, coupons
│   │   ├── pages/
│   │   │   ├── home/               # الصفحة الرئيسية
│   │   │   ├── products/           # كتالوج المنتجات وفلاتر البحث
│   │   │   ├── product-detail/     # تفاصيل المنتج ومعرض الصور
│   │   │   ├── cart/               # السلة وإتمام الطلب API
│   │   │   ├── wishlist/           # قائمة الرغبات
│   │   │   ├── contact/            # الفروع والتواصل
│   │   │   └── admin/              # لوحة التحكم الإدارية
│   │   │       ├── login/          # تسجيل دخول المسؤول
│   │   │       ├── layout/         # هيكل لوحة الإدارة والشريط الجانبي
│   │   │       ├── dashboard/      # الإحصائيات والمؤشرات
│   │   │       ├── orders/         # إدارة الطلبات
│   │   │       ├── order-detail/   # تفاصيل الطلب وتعديل الحالة
│   │   │       ├── products/       # إدارة الكتالوج والمخزون
│   │   │       └── coupons/        # إدارة قسائم الخصم
│   │   └── shared/                 # المكونات المشتركة والأيقونات
│   └── environments/               # ضبط مسارات الـ API
```

---

## 🗄️ تصميم قاعدة البيانات (Database Schema)

قاعدة البيانات مصممة وفق أحدث معايير **PostgreSQL** و **Prisma ORM**:

```mermaid
erDiagram
    Product ||--o{ OrderItem : "contains"
    Order ||--|{ OrderItem : "has"
    AdminUser {
        string id PK
        string name
        string email UK
        string passwordHash
        string role
        datetime createdAt
    }
    Coupon {
        string id PK
        string code UK
        string discountType
        float discountValue
        boolean isActive
        datetime expiryDate
        int usageCount
    }
    Product {
        string id PK
        string name
        string nameAr
        float price
        float oldPrice
        string image
        string category
        string brand
        int stock
        string sku UK
    }
    Order {
        string id PK
        string orderNumber UK
        string customerName
        string phone
        string email
        string address
        string city
        float subtotal
        float discount
        float shipping
        float total
        string paymentMethod
        string paymentStatus
        string orderStatus
        datetime createdAt
    }
    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        string productName
        string productImage
        float unitPrice
        int quantity
        float total
    }
```

---

## 🚀 دليل التثبيت والتشغيل السريع (Getting Started)

### المتطلبات الأساسية
- **Node.js**: الإصدار 18 أو أحدث.
- **npm**: الإصدار 9 أو أحدث.
- **PostgreSQL** (اختياري للإنتاج): يأتي النظام بمحرك تخزين صامد (Resilient Fallback Storage Engine) يعمل تلقائياً وبكفاءة 100% حتى لو لم تكن خدمة PostgreSQL المحلية مثبتة، مما يتيح تجربة واختبار النظام بالكامل فورياً دون أي إخفاق.

---

### أولاً: إعداد وتشغيل الخادم الخلفي (Backend)

1. انتقل لمجلد الـ Backend:
```bash
cd backend
```

2. قم بتثبيت الاعتماديات:
```bash
npm install
```

3. اضبط المتغيرات البيئية:
```bash
# انسخ ملف البيئة النموذجي
cp .env.example .env
```

محتوى ملف `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/optica_luxe?schema=public
JWT_SECRET=optica_luxe_super_secure_jwt_secret_key_2026_zentrix
JWT_EXPIRES_IN=7d
ADMIN_DEFAULT_EMAIL=admin@optica-luxe.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
ADMIN_DEFAULT_NAME=Zentrix Administrator
CORS_ORIGIN=http://localhost:4200
```

4. ترحيل قاعدة البيانات وتوليد عميل Prisma (عند توفر PostgreSQL):
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

5. تشغيل خادم التطوير:
```bash
npm run dev
```
سيعمل الخادم على: `http://localhost:5000/api`

---

### ثانياً: إعداد وتشغيل الواجهة الأمامية (Frontend)

1. انتقل لمجلد المشروع الرئيسي:
```bash
cd ..
```

2. قم بتثبيت الاعتماديات:
```bash
npm install
```

3. تشغيل خادم التطوير:
```bash
npm start
# أو: ng serve
```
افتح المتصفح على: `http://localhost:4200`

---

## 🔐 بيانات دخول لوحة تحكم الإدارة التجريبية (Admin Credentials)

- **رابط تسجيل الدخول:** `http://localhost:4200/admin/login`
- **البريد الإلكتروني:** `admin@optica-luxe.com`
- **كلمة المرور:** `Admin@123456`

> **ملاحظة أمنية:** تُقرأ بيانات المشرف الافتراضي من المتغيرات البيئية (`ADMIN_DEFAULT_EMAIL` و `ADMIN_DEFAULT_PASSWORD`) وتُشفر تجزئتها بـ `bcrypt` بقوة 10 جولات (Salt Rounds).

---

## 🎟️ كوبونات الخصم التجريبية الجاهزة للاختبار (Demo Coupons)

| كود الكوبون | نوع الخصم | القيمة | الحالة |
| :--- | :--- | :--- | :--- |
| `LUXE2026` | نسبة مئوية | 20% خصم | مفعل |
| `OPTICA15` | نسبة مئوية | 15% خصم | مفعل |
| `VIP20` | نسبة مئوية | 20% خصم | مفعل |

---

## 📡 وثائق الـ REST API (API Documentation)

### 1. المصادقة (Authentication)
- `POST /api/auth/login`: تسجيل دخول المشرف واستلام رمز الـ JWT.
- `GET /api/auth/me`: استرجاع بيانات المشرف الحالي عبر الـ Bearer Token.

### 2. الطلبات (Orders)
- `POST /api/orders`: إنشاء طلب جديد (يتحقق من المخزون، الأسعار، وحساب المجموع).
- `GET /api/orders`: استعراض قائمة الطلبات مع دعم البحث والفلترة والترتيب (يتطلب JWT).
- `GET /api/orders/:id`: استعراض تفاصيل طلب محدد بالمعرف أو برقم الطلب (يتطلب JWT).
- `PATCH /api/orders/:id/status`: تحديث حالة الطلب وحالة الدفع والملاحظات (يتطلب JWT).

### 3. المنتجات (Products)
- `GET /api/products`: استعراض المنتجات مع الفلترة بالماركة، الفئة، والبحث.
- `GET /api/products/:id`: استعراض تفاصيل منتج محدد.
- `POST /api/products`: إضافة منتج جديد (يتطلب JWT).
- `PUT /api/products/:id`: تعديل منتج قائم (يتطلب JWT).
- `DELETE /api/products/:id`: حذف منتج من الكتالوج (يتطلب JWT).
- `PATCH /api/products/:id/stock`: تعديل سريع لكمية المخزون (يتطلب JWT).

### 4. الكوبونات (Coupons)
- `GET /api/coupons`: استعراض جميع الكوبونات (يتطلب JWT).
- `GET /api/coupons/validate/:code`: التحقق من صلاحية كود الخصم وحساب قيمته (عام).
- `POST /api/coupons`: إنشاء كوبون جديد (يتطلب JWT).
- `PUT /api/coupons/:id`: تعديل بيانات الكوبون (يتطلب JWT).
- `PATCH /api/coupons/:id/toggle`: تفعيل أو تعطيل الكوبون (يتطلب JWT).
- `DELETE /api/coupons/:id`: حذف الكوبون (يتطلب JWT).

### 5. لوحة المؤشرات (Dashboard)
- `GET /api/dashboard/stats`: استخراج مقاييس الـ KPIs، المبيعات الإجمالية، الطلبات المعلقة، وتوزيع الحالات (يتطلب JWT).

---

## 🧪 الاختبارات الآلية ومراقبة الجودة (Testing & Verification)

تم تضمين منظومة شاملة من الاختبارات الآلية (25 اختباراً مؤكداً) لتغطية جميع حالات الاستخدام والحدود الحرجة (Edge Cases):

### تشغيل اختبارات الواجهة الأمامية (Frontend):
```bash
npm test
```
- **النتائج:** 13/13 اختبار ناجح (خدمات السلة، المنتجات، والتهيئة).

### تشغيل اختبارات الخادم الخلفي (Backend):
```bash
cd backend
npm test
```
- **النتائج:** 12/12 اختبار ناجح يشمل:
  1. مصادقة المشرف والتحقق من كلمات المرور الخاطئة.
  2. إنشاء الطلب والتحقق الصارم من الحسابات المالية server-side.
  3. رفض الطلبات عند إرسال معرف منتج غير موجود (`400 Bad Request`).
  4. رفض الطلبات عند تجاوز الكمية المطلوبة لرصيد المخزون المتوفر (`400 Bad Request`).
  5. التحقق من صلاحية الكوبونات ورفض الكود غير الصالح (`404 Not Found`).
  6. فحص ترخيص مسارات الإدارة المحمية ومنع الوصول غير المصرح به (`401 Unauthorized`).

---

## 🛠️ البناء للإنتاج (Production Builds)

### بناء الواجهة الأمامية:
```bash
npm run build
```
المخرجات تُحفظ في المجلد: `dist/optica-luxe`

### بناء الخادم الخلفي:
```bash
cd backend
npm run build
```
المخرجات تُحفظ في المجلد: `backend/dist`

---

## 📄 حقوق الملكية وإشعار الوضع التجريبي (Demo Mode Notice)

هذا التطبيق هو **مشروع معرض أعمال تجريبي (Portfolio Project)** مخصص لـ **Zentrix**، ولا يقوم بمعالجة أي مدفوعات بنكية حقيقية أو شحن فعلي. جميع المعاملات والبيانات المسجلة هي لأغراض العرض التوضيحي وإبراز القدرات الهندسية الكاملة لتطوير تطبيقات التجارة الإلكترونية الشاملة.
