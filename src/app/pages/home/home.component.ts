import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-page">
      <!-- 1. Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-overlay"></div>
        <div class="container hero-container">
          <div class="hero-text-content">
            <div class="hero-tag animate-fade-in">
              <app-icon name="sparkles" [size]="15" class="gold-icon"></app-icon>
              <span>تشكيلة خريف وشتاء 2026 الحصرية</span>
            </div>

            <h1 class="hero-title animate-fade-in">
              الرؤية بأسلوب الفخامة المطلقة
            </h1>

            <p class="hero-description animate-fade-in">
              اكتشف أرقى الإطارات العالمية والنظارات الشمسية والطبية المصنوعة يدوياً من التيتانيوم النقي والذهب والأسيتات الإيطالي، بتوقيع أشهر دور الأزياء في العالم.
            </p>

            <div class="hero-cta-group animate-fade-in">
              <a routerLink="/products" [queryParams]="{ category: 'sunglasses' }" class="btn btn-gold btn-lg">
                <span>تسوق المجموعة الجديدة</span>
                <app-icon name="arrow-left" [size]="18"></app-icon>
              </a>

              <a routerLink="/products" [queryParams]="{ category: 'all' }" class="btn btn-outline-white btn-lg">
                <span>استكشف كل الماركات</span>
              </a>
            </div>

            <!-- Floating Trust Badges in Hero -->
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">+5,000</span>
                <span class="stat-label">عميل متميز في الخليج</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">100%</span>
                <span class="stat-label">أصلية مع شهادة ضمان</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">24/7</span>
                <span class="stat-label">استشارة بصرية مجانية</span>
              </div>
            </div>
          </div>

          <!-- Hero Visual Collage -->
          <div class="hero-visual">
            <div class="hero-card-main">
              <img
                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85"
                alt="نظارة كارتييه إمبيريال جولد"
                class="hero-img"
              />
              <div class="floating-badge-glass">
                <div class="badge-icon">
                  <app-icon name="award" [size]="20" class="gold-icon"></app-icon>
                </div>
                <div class="badge-details">
                  <span class="brand">كارتييه بانثير</span>
                  <span class="highlight">ذهب خالص عيار 18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Shop by Category -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">التصنيفات الراقية</span>
            <h2 class="section-title">تسوق حسب الفئة</h2>
            <p class="section-subtitle">إطارات وتصاميم هندسية تناسب أدق تفاصيل ملامحك ونمط حياتك الراقي</p>
          </div>

          <div class="categories-grid">
            <!-- Cat 1 -->
            <a routerLink="/products" [queryParams]="{ category: 'sunglasses' }" class="category-card">
              <div class="cat-img-box">
                <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=700&q=80" alt="نظارات شمسية" />
              </div>
              <div class="cat-content">
                <span class="cat-count">120+ موديل</span>
                <h3 class="cat-name">نظارات شمسية</h3>
                <span class="cat-link">استكشف التشكيلة &larr;</span>
              </div>
            </a>

            <!-- Cat 2 -->
            <a routerLink="/products" [queryParams]="{ category: 'eyeglasses' }" class="category-card">
              <div class="cat-img-box">
                <img src="https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=700&q=80" alt="نظارات طبية" />
              </div>
              <div class="cat-content">
                <span class="cat-count">95+ تصميم</span>
                <h3 class="cat-name">نظارات طبية ذكية</h3>
                <span class="cat-link">استكشف التشكيلة &larr;</span>
              </div>
            </a>

            <!-- Cat 3 -->
            <a routerLink="/products" [queryParams]="{ category: 'luxury-frames' }" class="category-card featured">
              <div class="cat-img-box">
                <img src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=700&q=80" alt="إطارات فاخرة ومطلية بالذهب" />
              </div>
              <div class="cat-content">
                <span class="cat-tag">كوليكشن خاص</span>
                <h3 class="cat-name">إطارات مطلية بالذهب</h3>
                <span class="cat-link">استكشف التشكيلة &larr;</span>
              </div>
            </a>

            <!-- Cat 4 -->
            <a routerLink="/products" [queryParams]="{ category: 'contact-lenses' }" class="category-card">
              <div class="cat-img-box">
                <img src="https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=700&q=80" alt="عدسات لاصقة" />
              </div>
              <div class="cat-content">
                <span class="cat-count">طبية وتجميلية</span>
                <h3 class="cat-name">عدسات لاصقة معتمدة</h3>
                <span class="cat-link">استكشف التشكيلة &larr;</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- 3. Best-Selling Products -->
      <section class="section bestsellers-section">
        <div class="container">
          <div class="section-header-row">
            <div>
              <span class="section-tag">الأعلى طلباً</span>
              <h2 class="section-title">الأكثر مبيعاً وتفضيلاً</h2>
            </div>
            <a routerLink="/products" [queryParams]="{ sortBy: 'price-desc' }" class="btn btn-outline">
              <span>عرض كل الموديلات</span>
              <app-icon name="arrow-left" [size]="16"></app-icon>
            </a>
          </div>

          <div class="products-grid">
            @for (product of productService.bestSellers().slice(0, 4); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </div>
      </section>

      <!-- 4. Promotional Banner / Editorial Campaign -->
      <section class="editorial-banner">
        <div class="container banner-container">
          <div class="banner-card">
            <div class="banner-content">
              <span class="banner-tag">حملة الشتاء الخاصة • كود LUXE2026</span>
              <h2 class="banner-heading">حرفية يدوية لا تُضاهى، وحماية متكاملة لبصرك</h2>
              <p class="banner-body">
                نجمع لك أرقى ما أبدعته دور الأزياء العالمية في باريس وميلانو مع أدق عدسات البصريات الألمانية المتطورة. احصل على كشف وتفصيل مجاني للعدسات مع كل إطار فاخر بقيمة تتجاوز 1500 ج.م.
              </p>
              <div class="banner-buttons">
                <a routerLink="/products" [queryParams]="{ category: 'luxury-frames' }" class="btn btn-gold">
                  <span>اغتنم العرض الحصري</span>
                  <app-icon name="sparkles" [size]="16"></app-icon>
                </a>
                <a routerLink="/contact" class="btn btn-outline-white">
                  <span>حجز موعد فحص البصر</span>
                </a>
              </div>
            </div>
            <div class="banner-image">
              <img
                src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=900&q=85"
                alt="حملة أوبتيكا لاكشري"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 5. New Arrivals -->
      <section class="section new-arrivals-section">
        <div class="container">
          <div class="section-header-row">
            <div>
              <span class="section-tag">وصل حديثاً</span>
              <h2 class="section-title">أحدث إصدارات الموسم</h2>
            </div>
            <a routerLink="/products" [queryParams]="{ onlyNew: true }" class="btn btn-outline">
              <span>استكشف الجديد</span>
              <app-icon name="arrow-left" [size]="16"></app-icon>
            </a>
          </div>

          <div class="products-grid">
            @for (product of productService.newArrivals().slice(0, 4); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </div>
      </section>

      <!-- 6. Why Choose Us -->
      <section class="section why-us-section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">معايير التميز</span>
            <h2 class="section-title">لماذا تختار أوبتيكا لاكشري؟</h2>
            <p class="section-subtitle">نقدم معياراً غير مسبوق في العناية بالعيون وتجربة اقتناء النظارات الفاخرة</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <app-icon name="award" [size]="28" class="gold-icon"></app-icon>
              </div>
              <h3>أصالة موثقة 100%</h3>
              <p>جميع النظارات والإطارات أصلية مباشرة من المصنعين المعتمدين في إيطاليا واليابان والدنمارك مع شهادات ورقم تسلسلي.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <app-icon name="eye" [size]="28" class="gold-icon"></app-icon>
              </div>
              <h3>فحص بصري ثلاثي الأبعاد</h3>
              <p>أحدث أجهزة فحص قاع العين وقياس الانكسار الدقيق بإشراف نخبة من أخصائيي البصريات المرخصين من الهيئة السعودية للتخصصات الصحية.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <app-icon name="shield-check" [size]="28" class="gold-icon"></app-icon>
              </div>
              <h3>ضمان وصيانة سنتين مجاناً</h3>
              <p>ضمان شامل لعيوب التصنيع مع خدمات ضبط الانحناء، وتغيير وسادات الأنف، وتلميع الإطارات مجاناً مدى الحياة في كافة فروعنا.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <app-icon name="truck" [size]="28" class="gold-icon"></app-icon>
              </div>
              <h3>توصيل ملكي سريع ومؤمّن</h3>
              <p>شحن سريع في علب هدايا فاخرة معقمة ومؤمنة ضد الكسر أو الفقد، مع إمكانية تجربة النظارة في المنزل قبل الدفع.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Customer Reviews -->
      <section class="section reviews-section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">تجارب حقيقية</span>
            <h2 class="section-title">ماذا يقول عملاؤنا المتميزون</h2>
            <p class="section-subtitle">فخورون بثقة أكثر من 20,000 عميل في مختلف مدن المملكة والخليج العربي</p>
          </div>

          <div class="reviews-grid">
            <div class="review-card">
              <div class="stars">
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
              </div>
              <p class="review-text">
                "تجربة شراء راقية جداً تفوق التوقعات. اشتريت إطار ليندبيرغ التيتانيوم ونظارة كارتييه، التغليف الملكي وسرعة التوصيل وشهادات الأصالة جعلتني زبوناً دائماً لهم."
              </p>
              <div class="reviewer-info">
                <div class="avatar">س.ع</div>
                <div>
                  <h4 class="name">سلطان عبد العزيز العتيبي</h4>
                  <span class="city">الرياض • مشترٍ موثق</span>
                </div>
              </div>
            </div>

            <div class="review-card">
              <div class="stars">
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
              </div>
              <p class="review-text">
                "نظارة غوتشي الهندسية التي طلبتها أصلية 100%، والعدسات الطبية المضادة للأشعة الزرقاء خففت صداع العمل أمام الشاشات بشكل مذهل. شكراً لفريق خدمة العملاء على احترافيتهم."
              </p>
              <div class="reviewer-info">
                <div class="avatar">ن.ح</div>
                <div>
                  <h4 class="name">د. نورة الحارثي</h4>
                  <span class="city">جدة • مشترٍ موثق</span>
                </div>
              </div>
            </div>

            <div class="review-card">
              <div class="stars">
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
                <app-icon name="star-filled" [size]="16"></app-icon>
              </div>
              <p class="review-text">
                "أفضل بوتيك بصريات في الخليج بلا منازع. موديلات توم فورد وبيرسول القابلة للطي نادرة وصعب إيجادها، لكنها كانت متوفرة بتسليم فوري مع كود الخصم. جودة استثنائية."
              </p>
              <div class="reviewer-info">
                <div class="avatar">م.ش</div>
                <div>
                  <h4 class="name">م. فيصل الشمري</h4>
                  <span class="city">الخبر • مشترٍ موثق</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. Newsletter Subscription -->
      <section class="newsletter-section">
        <div class="container newsletter-container">
          <div class="newsletter-content">
            <span class="newsletter-tag">نادي النخبة أوبتيكا</span>
            <h2 class="newsletter-title">اشترك لتصلك العروض الحصرية وإصدارات المصممين أولاً</h2>
            <p class="newsletter-desc">
              سجل بريدك الإلكتروني واحصل فوراً على قسيمة خصم بقيمة 200 ج.م على مشترياتك القادمة مع دعوات خاصة لحضور إطلاق المجموعات الحصرية.
            </p>

            <form (submit)="onSubscribe($event)" class="newsletter-form">
              <input
                type="email"
                [(ngModel)]="emailInput"
                name="email"
                placeholder="أدخل بريدك الإلكتروني (مثال: luxury&#64;domain.com)"
                class="newsletter-input"
                required
              />
              <button type="submit" class="btn btn-gold">
                <span>انضم الآن</span>
                <app-icon name="sparkles" [size]="16"></app-icon>
              </button>
            </form>
            <p class="privacy-note">نحترم خصوصيتك بالكامل، ولن نرسل إليك سوى الرسائل المنتقاة بعناية.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* 1. Hero */
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, #181818 0%, #0D0D0D 100%);
      color: #FFFFFF;
      padding: 5rem 0 6rem;
      overflow: hidden;
    }

    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 75% 40%, rgba(197, 168, 128, 0.12) 0%, transparent 60%);
      pointer-events: none;
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      align-items: center;
      gap: 3.5rem;
      position: relative;
      z-index: 2;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.9rem;
      background: rgba(197, 168, 128, 0.15);
      border: 1px solid rgba(197, 168, 128, 0.3);
      border-radius: var(--radius-full);
      color: var(--c-gold);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }

    .hero-title {
      font-size: 3.4rem;
      font-weight: 800;
      line-height: 1.2;
      color: #FFFFFF;
      margin-bottom: 1.25rem;
      letter-spacing: -0.02em;
    }

    .hero-description {
      font-size: 1.12rem;
      color: #C8C2BA;
      line-height: 1.75;
      margin-bottom: 2.25rem;
      max-width: 580px;
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 3.5rem;
    }

    .btn-lg {
      padding: 0.9rem 2.2rem;
      font-size: 1rem;
    }

    .btn-outline-white {
      background: transparent;
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.35);

      &:hover {
        background: #FFFFFF;
        color: var(--c-dark);
        border-color: #FFFFFF;
        transform: translateY(-2px);
      }
    }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.12);

      .stat-item {
        display: flex;
        flex-direction: column;

        .stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--c-gold);
        }

        .stat-label {
          font-size: 0.8rem;
          color: #A8A29A;
        }
      }

      .stat-divider {
        width: 1px;
        height: 38px;
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .hero-visual {
      position: relative;
    }

    .hero-card-main {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(197, 168, 128, 0.25);

      .hero-img {
        width: 100%;
        height: 520px;
        object-fit: cover;
        display: block;
      }
    }

    .floating-badge-glass {
      position: absolute;
      bottom: 24px;
      right: 24px;
      background: rgba(18, 18, 18, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(197, 168, 128, 0.3);
      border-radius: var(--radius-md);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .badge-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(197, 168, 128, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .badge-details {
        display: flex;
        flex-direction: column;

        .brand {
          font-size: 0.95rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .highlight {
          font-size: 0.78rem;
          color: var(--c-gold);
        }
      }
    }

    /* Common Section */
    .section {
      padding: 5rem 0;
    }

    .section-header-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2.5rem;
    }

    /* 2. Categories */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .category-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all var(--transition-smooth);

      &:hover {
        border-color: var(--c-gold);
        box-shadow: var(--shadow-hover);
        transform: translateY(-5px);

        .cat-img-box img {
          transform: scale(1.08);
        }

        .cat-link {
          color: var(--c-gold-hover);
        }
      }

      .cat-img-box {
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background: #F8F6F2;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      }

      .cat-content {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;

        .cat-count, .cat-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--c-gold-dark);
          margin-bottom: 0.3rem;
          text-transform: uppercase;
        }

        .cat-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--c-dark);
          margin-bottom: 0.6rem;
        }

        .cat-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--c-dark-secondary);
          transition: color 0.2s;
        }
      }
    }

    /* 3. Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.75rem;
    }

    /* 4. Editorial Banner */
    .editorial-banner {
      padding: 3rem 0;
    }

    .banner-card {
      background: linear-gradient(135deg, #1C1917 0%, #12100E 100%);
      border-radius: var(--radius-md);
      border: 1px solid rgba(197, 168, 128, 0.3);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      align-items: center;
      color: #FFFFFF;
    }

    .banner-content {
      padding: 4rem 3.5rem;

      .banner-tag {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--c-gold);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        display: inline-block;
        margin-bottom: 1rem;
      }

      .banner-heading {
        font-size: 2.3rem;
        font-weight: 800;
        color: #FFFFFF;
        line-height: 1.3;
        margin-bottom: 1.25rem;
      }

      .banner-body {
        font-size: 1rem;
        color: #D3CDC5;
        line-height: 1.75;
        margin-bottom: 2rem;
      }

      .banner-buttons {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    .banner-image {
      height: 100%;
      min-height: 380px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    /* 6. Why choose us */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    .feature-card {
      background: #FFFFFF;
      padding: 2.25rem 1.75rem;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      text-align: center;
      transition: all var(--transition-smooth);

      &:hover {
        border-color: var(--c-gold);
        box-shadow: var(--shadow-hover);
        transform: translateY(-4px);

        .feature-icon {
          background-color: var(--c-gold);
          color: #121212;
        }
      }

      .feature-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: var(--c-gold-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.25rem auto;
        transition: all 0.3s;
      }

      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        margin-bottom: 0.6rem;
      }

      p {
        font-size: 0.88rem;
        color: var(--c-muted);
        line-height: 1.6;
      }
    }

    /* 7. Reviews */
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .review-card {
      background: #FFFFFF;
      padding: 2.25rem 2rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--c-border);
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-subtle);

      .stars {
        display: flex;
        color: var(--c-gold);
        gap: 0.2rem;
        margin-bottom: 1.25rem;
      }

      .review-text {
        font-size: 0.95rem;
        color: var(--c-dark-secondary);
        line-height: 1.75;
        font-style: italic;
        margin-bottom: 1.75rem;
        flex: 1;
      }

      .reviewer-info {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--c-gold-light);
          color: var(--c-gold-dark);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
        }

        .name {
          font-size: 0.92rem;
          font-weight: 700;
        }

        .city {
          font-size: 0.78rem;
          color: var(--c-muted);
        }
      }
    }

    /* 8. Newsletter */
    .newsletter-section {
      padding: 3rem 0;
    }

    .newsletter-container {
      background: linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%);
      border: 1px solid rgba(197, 168, 128, 0.35);
      border-radius: var(--radius-md);
      padding: 4.5rem 2rem;
      text-align: center;
      color: #FFFFFF;
    }

    .newsletter-content {
      max-width: 680px;
      margin: 0 auto;

      .newsletter-tag {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--c-gold);
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 0.75rem;
        display: inline-block;
      }

      .newsletter-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #FFFFFF;
        margin-bottom: 1rem;
        line-height: 1.3;
      }

      .newsletter-desc {
        font-size: 1rem;
        color: #CCC6BE;
        line-height: 1.7;
        margin-bottom: 2.25rem;
      }
    }

    .newsletter-form {
      display: flex;
      gap: 0.75rem;
      max-width: 540px;
      margin: 0 auto 1rem auto;

      .newsletter-input {
        flex: 1;
        padding: 0.85rem 1.25rem;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.08);
        color: #FFFFFF;
        font-size: 0.95rem;
        outline: none;

        &:focus {
          border-color: var(--c-gold);
          background: rgba(255, 255, 255, 0.12);
        }

        &::placeholder {
          color: #8C867D;
        }
      }
    }

    .privacy-note {
      font-size: 0.78rem;
      color: #8A857D;
    }

    .gold-icon {
      color: var(--c-gold);
    }

    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-tag {
        margin: 0 auto 1.5rem auto;
      }
      .hero-description {
        margin: 0 auto 2.25rem auto;
      }
      .hero-cta-group {
        justify-content: center;
      }
      .hero-stats {
        justify-content: center;
      }
      .categories-grid, .products-grid, .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .reviews-grid {
        grid-template-columns: 1fr;
      }
      .banner-card {
        grid-template-columns: 1fr;
      }
      .banner-image {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 2.2rem;
      }
      .categories-grid, .products-grid, .features-grid {
        grid-template-columns: 1fr;
      }
      .hero-stats {
        flex-direction: column;
        gap: 1rem;
      }
      .stat-divider {
        display: none;
      }
      .newsletter-form {
        flex-direction: column;
      }
      .newsletter-title {
        font-size: 1.6rem;
      }
    }
  `]
})
export class HomeComponent {
  productService = inject(ProductService);
  private notificationService = inject(NotificationService);

  emailInput = '';

  onSubscribe(event: Event): void {
    event.preventDefault();
    if (!this.emailInput || !this.emailInput.includes('@')) {
      this.notificationService.warning('يرجى كتابة بريد إلكتروني صالح');
      return;
    }
    this.notificationService.success(
      `شكراً لانضمامك! تم إرسال كود خصم بقيمة 200 ج.م إلى ${this.emailInput}`,
      'مرحباً بك في نادي النخبة'
    );
    this.emailInput = '';
  }
}

