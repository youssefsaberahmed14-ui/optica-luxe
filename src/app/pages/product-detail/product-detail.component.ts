import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LensOption, Product, ProductColor } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <div class="product-detail-page">
        <!-- Breadcrumb -->
        <div class="breadcrumb-container">
          <div class="container">
            <nav class="breadcrumb-nav">
              <a routerLink="/">الرئيسية</a>
              <span class="sep">/</span>
              <a routerLink="/products" [queryParams]="{ category: p.category }">{{ p.categoryAr }}</a>
              <span class="sep">/</span>
              <span class="current">{{ p.nameAr }}</span>
            </nav>
          </div>
        </div>

        <div class="container product-main-container">
          <div class="product-showcase-grid">
            <!-- Left Column: Gallery -->
            <div class="gallery-column">
              <div class="main-image-viewport">
                <img [src]="activeImage() || p.images[0]" [alt]="p.nameAr" class="main-zoom-image" />
                <div class="badges-overlay">
                  @if (p.discountPercent) {
                    <span class="badge badge-sale">خصم {{ p.discountPercent }}%</span>
                  }
                  @if (p.isNew) {
                    <span class="badge badge-new">جديد</span>
                  }
                  @if (p.material === 'titanium') {
                    <span class="badge badge-gold">تيتانيوم ياباني نقي</span>
                  }
                </div>
              </div>

              <!-- Thumbnails -->
              @if (p.images.length > 1) {
                <div class="thumbnail-strip">
                  @for (img of p.images; track img) {
                    <button
                      (click)="setActiveImage(img)"
                      class="thumb-tile"
                      [class.active]="(activeImage() || p.images[0]) === img"
                    >
                      <img [src]="img" [alt]="p.nameAr" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Product Meta & Purchase -->
            <div class="info-column">
              <div class="brand-line">
                <span class="brand-name">{{ p.brandAr }}</span>
                <span class="brand-en font-brand">{{ p.brand }}</span>
                <span class="sku-number">SKU: {{ p.sku }}</span>
              </div>

              <h1 class="product-heading">{{ p.nameAr }}</h1>
              <p class="product-subheading font-brand">{{ p.name }}</p>

              <!-- Reviews & Stock -->
              <div class="rating-stock-bar">
                <div class="stars-wrap">
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <span class="rating-val">{{ p.rating }}</span>
                  <span class="reviews-count">({{ p.reviewCount }} تقييم موثق)</span>
                </div>

                <div class="in-stock-tag">
                  <app-icon name="check" [size]="14"></app-icon>
                  <span>متوفر في المستودع الرئيسي والتسليم فوري</span>
                </div>
              </div>

              <!-- Price Box -->
              <div class="price-highlight-box">
                <div class="price-figures">
                  <span class="current-price">{{ calculatedPrice() }} <span class="currency">ج.م</span></span>
                  @if (p.oldPrice) {
                    <span class="old-price">{{ p.oldPrice }} ج.م</span>
                    <span class="save-tag">وفرت {{ (p.oldPrice - p.price) }} ج.م</span>
                  }
                </div>
                <div class="tax-note">السعر شامل ضريبة القيمة المضافة 15% وتوصيل مجاني</div>
              </div>

              <!-- Color Selector -->
              <div class="selection-section">
                <label class="selection-title">
                  لون الإطار:
                  <strong>{{ selectedColor().nameAr }}</strong>
                </label>
                <div class="color-options">
                  @for (c of p.colors; track c.code) {
                    <button
                      (click)="selectColor(c)"
                      class="color-card"
                      [class.active]="selectedColor().code === c.code"
                    >
                      <span class="color-circle" [style.background-color]="c.code"></span>
                      <span class="color-text">{{ c.nameAr }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Lens Options Selector -->
              <div class="selection-section">
                <div class="lens-header">
                  <label class="selection-title">اختر نوع العدسات:</label>
                  <span class="prescription-help">هل تحتاج مساعدة في مقاس نظرك؟ تواصل معنا عبر واتساب</span>
                </div>
                <div class="lens-cards-grid">
                  @for (lens of productService.lensOptions; track lens.id) {
                    <div
                      class="lens-card-item"
                      [class.selected]="selectedLens().id === lens.id"
                      (click)="selectLens(lens)"
                    >
                      <div class="lens-card-top">
                        <span class="lens-name">{{ lens.nameAr }}</span>
                        <span class="lens-badge">{{ lens.price === 0 ? 'مضمنة مجاناً' : '+ ' + lens.price + ' ج.م' }}</span>
                      </div>
                      <p class="lens-desc">{{ lens.descriptionAr }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Specs Summary Pill Bar -->
              <div class="specs-summary-bar">
                <div class="spec-cell">
                  <span class="lbl">شكل الإطار</span>
                  <span class="val">{{ p.shapeAr }}</span>
                </div>
                <div class="spec-cell">
                  <span class="lbl">مادة الصنع</span>
                  <span class="val">{{ p.materialAr }}</span>
                </div>
                <div class="spec-cell">
                  <span class="lbl">أبعاد الإطار</span>
                  <span class="val">{{ p.dimensions.lensWidth }}-{{ p.dimensions.bridgeWidth }}-{{ p.dimensions.templeLength }} مم</span>
                </div>
                <div class="spec-cell">
                  <span class="lbl">الفئة المستهدفة</span>
                  <span class="val">{{ p.genderAr }}</span>
                </div>
              </div>

              <!-- Quantity and Purchase Actions -->
              <div class="purchase-actions-box">
                <div class="quantity-controller">
                  <button (click)="decreaseQty()" class="ctrl-btn" aria-label="تقليل">
                    <app-icon name="minus" [size]="14"></app-icon>
                  </button>
                  <span class="qty-display">{{ quantity() }}</span>
                  <button (click)="increaseQty()" class="ctrl-btn" aria-label="زيادة">
                    <app-icon name="plus" [size]="14"></app-icon>
                  </button>
                </div>

                <button (click)="onAddToCart(p)" class="btn btn-primary add-cart-btn">
                  <app-icon name="cart" [size]="18"></app-icon>
                  <span>أضف إلى السلة ({{ calculatedTotal() }} ج.م)</span>
                </button>

                <button (click)="onBuyNow(p)" class="btn btn-gold buy-now-btn">
                  <span>شراء الآن</span>
                  <app-icon name="arrow-left" [size]="16"></app-icon>
                </button>

                <button
                  (click)="toggleWishlist(p)"
                  class="btn-icon wishlist-toggle-btn"
                  [class.active]="isInWishlist(p.id)"
                  title="إضافة للمفضلة"
                >
                  <app-icon [name]="isInWishlist(p.id) ? 'heart-filled' : 'heart'" [size]="20"></app-icon>
                </button>
              </div>

              <!-- Assurances Grid -->
              <div class="product-perks-list">
                <div class="perk-row">
                  <app-icon name="truck" [size]="18" class="gold-icon"></app-icon>
                  <span>توصيل مجاني فاخر وسريع خلال 24 - 48 ساعة</span>
                </div>
                <div class="perk-row">
                  <app-icon name="award" [size]="18" class="gold-icon"></app-icon>
                  <span>ضمان الوكيل الرسمي المعتمد لمدة سنتين</span>
                </div>
                <div class="perk-row">
                  <app-icon name="rotate-ccw" [size]="18" class="gold-icon"></app-icon>
                  <span>إمكانية الاستبدال أو الإرجاع المجاني خلال 14 يوماً</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Detailed Tabs -->
          <div class="product-tabs-section">
            <div class="tabs-nav">
              <button
                (click)="activeTab.set('story')"
                class="tab-btn"
                [class.active]="activeTab() === 'story'"
              >
                تفاصيل وحرفية النظارة
              </button>
              <button
                (click)="activeTab.set('specs')"
                class="tab-btn"
                [class.active]="activeTab() === 'specs'"
              >
                المواصفات التقنية والأبعاد
              </button>
              <button
                (click)="activeTab.set('care')"
                class="tab-btn"
                [class.active]="activeTab() === 'care'"
              >
                دليل العناية والصيانة
              </button>
              <button
                (click)="activeTab.set('reviews')"
                class="tab-btn"
                [class.active]="activeTab() === 'reviews'"
              >
                تقييمات العملاء ({{ p.reviewCount }})
              </button>
            </div>

            <div class="tab-panel animate-fade-in">
              @switch (activeTab()) {
                @case ('story') {
                  <div class="story-panel">
                    <h3>حرفية التصميم ولمسة الإبداع</h3>
                    <p class="story-lead">{{ p.descriptionAr }}</p>
                    <p class="story-details">{{ p.storyAr }}</p>

                    <h4 class="features-title">أبرز المزايا والخصائص:</h4>
                    <ul class="features-list">
                      @for (feat of p.featuresAr; track feat) {
                        <li>
                          <app-icon name="check" [size]="16" class="gold-icon"></app-icon>
                          <span>{{ feat }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                }

                @case ('specs') {
                  <div class="specs-panel">
                    <h3>المواصفات الدقيقة للإطار والعدسات</h3>
                    <table class="specs-table">
                      <tbody>
                        <tr>
                          <th>الماركة العالمية</th>
                          <td>{{ p.brandAr }} ({{ p.brand }})</td>
                        </tr>
                        <tr>
                          <th>شكل الإطار</th>
                          <td>{{ p.shapeAr }}</td>
                        </tr>
                        <tr>
                          <th>مادة الإطار</th>
                          <td>{{ p.materialAr }}</td>
                        </tr>
                        <tr>
                          <th>عرض العدسة (Lens Width)</th>
                          <td>{{ p.dimensions.lensWidth }} مم</td>
                        </tr>
                        <tr>
                          <th>عرض جسر الأنف (Bridge Width)</th>
                          <td>{{ p.dimensions.bridgeWidth }} مم</td>
                        </tr>
                        <tr>
                          <th>طول الذراع (Temple Length)</th>
                          <td>{{ p.dimensions.templeLength }} مم</td>
                        </tr>
                        <tr>
                          <th>فئة الحماية</th>
                          <td>حماية قصوى UV400 مع طبقات مانعة للوهج والانعكاس</td>
                        </tr>
                        <tr>
                          <th>بلد المنشأ</th>
                          <td>صنع يدوي في ورش البصريات الأوروبية المعتمدة</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }

                @case ('care') {
                  <div class="care-panel">
                    <h3>إرشادات العناية بنظارتك الفاخرة</h3>
                    <div class="care-cards-grid">
                      <div class="care-card">
                        <h4>التنظيف اليومي</h4>
                        <p>استخدم قطعة القماش المايكروفايبر المرفقة مع بخاخ التنظيف النانو الخالي من الكحول. تجنب مسح العدسات بالمناديل الورقية أو الملابس.</p>
                      </div>
                      <div class="care-card">
                        <h4>الحفظ والتخزين</h4>
                        <p>احفظ النظارة دائماً داخل علبتها الصلبة المبطنة بالمخمل عند عدم ارتدائها، ولا تتركها معرضة لأشعة الشمس المباشرة على لوحة قيادة السيارة.</p>
                      </div>
                      <div class="care-card">
                        <h4>الصيانة المجانية</h4>
                        <p>تفضل بزيارة أي من فروع أوبتيكا لاكشري لضبط المفصلات واستبدال وسادات الأنف السيليكونية وتلميع الإطار بالموجات فوق الصوتية مجاناً.</p>
                      </div>
                    </div>
                  </div>
                }

                @case ('reviews') {
                  <div class="reviews-panel">
                    <div class="reviews-summary-row">
                      <div class="score-large">
                        <span class="num">{{ p.rating }}</span>
                        <div class="stars">
                          <app-icon name="star-filled" [size]="18"></app-icon>
                          <app-icon name="star-filled" [size]="18"></app-icon>
                          <app-icon name="star-filled" [size]="18"></app-icon>
                          <app-icon name="star-filled" [size]="18"></app-icon>
                          <app-icon name="star-filled" [size]="18"></app-icon>
                        </div>
                        <span class="based-on">بناءً على {{ p.reviewCount }} تقييم موثق</span>
                      </div>
                    </div>

                    <div class="user-comments-list">
                      <div class="comment-item">
                        <div class="comment-header">
                          <div class="stars">
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                          </div>
                          <span class="comment-author">أحمد السديري - الرياض</span>
                          <span class="comment-date">قبل 3 أيام</span>
                        </div>
                        <p class="comment-body">
                          "نظارة فاخرة بكل ما تعنيه الكلمة. خفيفة جداً على الوجه والتفاصيل الذهبية غاية في الأناقة والجمال. خدمة التوصيل كانت في غضون 24 ساعة فقط."
                        </p>
                      </div>

                      <div class="comment-item">
                        <div class="comment-header">
                          <div class="stars">
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                            <app-icon name="star-filled" [size]="14"></app-icon>
                          </div>
                          <span class="comment-author">ريم المنصور - جدة</span>
                          <span class="comment-date">قبل أسبوع</span>
                        </div>
                        <p class="comment-body">
                          "العدسات مريحة للغاية والشكل ملفت ومميز. تغليف الصندوق رائع كهدية فاخرة. أنصح بها بشدة."
                        </p>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Related Products Section -->
          @if (relatedProducts().length > 0) {
            <div class="related-products-section">
              <div class="section-header">
                <span class="section-tag">قد يعجبك أيضاً</span>
                <h2 class="section-title">قطع متناغمة مع ذوقك</h2>
              </div>
              <div class="related-grid">
                @for (rel of relatedProducts(); track rel.id) {
                  <app-product-card [product]="rel"></app-product-card>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .breadcrumb-container {
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border);
      padding: 1rem 0;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--c-muted);

      a {
        color: var(--c-dark-secondary);
        &:hover { color: var(--c-gold-hover); }
      }

      .current {
        color: var(--c-dark);
        font-weight: 700;
      }
    }

    .product-main-container {
      padding: 3.5rem 1.5rem;
    }

    .product-showcase-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 3.5rem;
      margin-bottom: 4rem;
    }

    /* Gallery */
    .gallery-column {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .main-image-viewport {
      aspect-ratio: 1 / 1;
      background-color: #F8F6F2;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--c-border);
      position: relative;

      .main-zoom-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .badges-overlay {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .thumbnail-strip {
      display: flex;
      gap: 0.85rem;

      .thumb-tile {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-sm);
        border: 2px solid transparent;
        overflow: hidden;
        cursor: pointer;
        background: #F8F6F2;
        transition: all 0.2s;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.active {
          border-color: var(--c-gold);
          box-shadow: 0 4px 12px rgba(197, 168, 128, 0.3);
        }
      }
    }

    /* Info Column */
    .info-column {
      display: flex;
      flex-direction: column;
    }

    .brand-line {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 0.5rem;

      .brand-name {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--c-gold-dark);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .brand-en {
        font-size: 0.85rem;
        color: var(--c-muted);
      }

      .sku-number {
        margin-right: auto;
        font-size: 0.78rem;
        color: var(--c-muted-light);
      }
    }

    .product-heading {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--c-dark);
      margin-bottom: 0.25rem;
      line-height: 1.25;
    }

    .product-subheading {
      font-size: 1.1rem;
      color: var(--c-muted);
      margin-bottom: 1.25rem;
    }

    .rating-stock-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--c-border-light);
      margin-bottom: 1.5rem;

      .stars-wrap {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        color: var(--c-gold);
        font-size: 0.88rem;

        .rating-val {
          font-weight: 700;
          color: var(--c-dark);
          margin-right: 0.3rem;
        }

        .reviews-count {
          color: var(--c-muted);
        }
      }

      .in-stock-tag {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--c-success);
      }
    }

    .price-highlight-box {
      background-color: var(--c-surface-soft);
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.75rem;

      .price-figures {
        display: flex;
        align-items: baseline;
        gap: 1rem;
        margin-bottom: 0.4rem;

        .current-price {
          font-size: 2rem;
          font-weight: 800;
          color: var(--c-dark);

          .currency {
            font-size: 1.1rem;
            color: var(--c-muted);
          }
        }

        .old-price {
          font-size: 1.15rem;
          color: var(--c-muted-light);
          text-decoration: line-through;
        }

        .save-tag {
          background-color: var(--c-gold-light);
          color: var(--c-gold-dark);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
        }
      }

      .tax-note {
        font-size: 0.82rem;
        color: var(--c-muted);
      }
    }

    .selection-section {
      margin-bottom: 1.75rem;

      .selection-title {
        font-size: 0.92rem;
        font-weight: 700;
        margin-bottom: 0.65rem;
        display: block;

        strong {
          color: var(--c-gold-dark);
        }
      }
    }

    .color-options {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;

      .color-card {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        background: #FFFFFF;
        cursor: pointer;
        transition: all 0.2s;

        .color-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
        }

        .color-text {
          font-size: 0.86rem;
          font-weight: 600;
        }

        &.active {
          border-color: var(--c-dark);
          background-color: var(--c-surface-soft);
          box-shadow: 0 0 0 2px var(--c-dark);
        }
      }
    }

    .lens-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.65rem;

      .prescription-help {
        font-size: 0.78rem;
        color: var(--c-gold-dark);
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .lens-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;

      .lens-card-item {
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        padding: 0.85rem;
        cursor: pointer;
        background: #FFFFFF;
        transition: all 0.25s;

        &:hover {
          border-color: var(--c-gold);
        }

        &.selected {
          border-color: var(--c-gold);
          background-color: var(--c-gold-light);
          box-shadow: 0 0 0 2px var(--c-gold);
        }

        .lens-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;

          .lens-name {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--c-dark);
          }

          .lens-badge {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--c-gold-dark);
          }
        }

        .lens-desc {
          font-size: 0.76rem;
          color: var(--c-muted);
          line-height: 1.4;
        }
      }
    }

    .specs-summary-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      background-color: var(--c-surface);
      padding: 0.85rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1.75rem;

      .spec-cell {
        display: flex;
        flex-direction: column;

        .lbl {
          font-size: 0.72rem;
          color: var(--c-muted);
        }

        .val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--c-dark);
        }
      }
    }

    .purchase-actions-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;

      .quantity-controller {
        display: flex;
        align-items: center;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        overflow: hidden;

        .ctrl-btn {
          width: 44px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;

          &:hover {
            background-color: var(--c-surface);
          }
        }

        .qty-display {
          padding: 0 1rem;
          font-size: 1rem;
          font-weight: 700;
        }
      }

      .add-cart-btn {
        flex: 1.2;
        height: 48px;
      }

      .buy-now-btn {
        flex: 1;
        height: 48px;
      }

      .wishlist-toggle-btn {
        width: 48px;
        height: 48px;

        &.active {
          color: var(--c-danger);
          border-color: var(--c-danger);
        }
      }
    }

    .product-perks-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--c-border);

      .perk-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.88rem;
        color: var(--c-dark-secondary);
      }
    }

    /* Tabs */
    .product-tabs-section {
      margin-top: 4rem;
      margin-bottom: 4rem;
    }

    .tabs-nav {
      display: flex;
      border-bottom: 2px solid var(--c-border);
      gap: 1.5rem;

      .tab-btn {
        padding: 1rem 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--c-muted);
        position: relative;
        transition: color 0.2s;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          right: 0;
          width: 0;
          height: 2px;
          background-color: var(--c-gold);
          transition: width 0.3s;
        }

        &:hover {
          color: var(--c-dark);
        }

        &.active {
          color: var(--c-dark);
          &::after {
            width: 100%;
          }
        }
      }
    }

    .tab-panel {
      padding: 2.5rem 0;
    }

    .story-panel {
      max-width: 820px;

      h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }

      .story-lead {
        font-size: 1.1rem;
        color: var(--c-dark);
        line-height: 1.8;
        margin-bottom: 1rem;
      }

      .story-details {
        font-size: 0.98rem;
        color: var(--c-muted);
        line-height: 1.8;
        margin-bottom: 2rem;
      }

      .features-title {
        font-size: 1.15rem;
        margin-bottom: 1rem;
      }

      .features-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.95rem;
        }
      }
    }

    .specs-table {
      width: 100%;
      max-width: 780px;
      border-collapse: collapse;
      margin-top: 1rem;

      th, td {
        padding: 0.9rem 1.25rem;
        font-size: 0.92rem;
        border-bottom: 1px solid var(--c-border-light);
      }

      th {
        width: 35%;
        background-color: var(--c-surface-soft);
        color: var(--c-dark-secondary);
        font-weight: 700;
        text-align: right;
      }

      td {
        color: var(--c-dark);
      }
    }

    .care-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 1.5rem;

      .care-card {
        background: #FFFFFF;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        padding: 1.75rem;

        h4 {
          font-size: 1.1rem;
          color: var(--c-gold-dark);
          margin-bottom: 0.6rem;
        }

        p {
          font-size: 0.88rem;
          color: var(--c-muted);
          line-height: 1.7;
        }
      }
    }

    .reviews-panel {
      max-width: 780px;

      .reviews-summary-row {
        margin-bottom: 2rem;

        .score-large {
          display: flex;
          align-items: center;
          gap: 1rem;

          .num {
            font-size: 3rem;
            font-weight: 800;
            color: var(--c-dark);
          }

          .stars {
            color: var(--c-gold);
            display: flex;
            gap: 0.2rem;
          }

          .based-on {
            font-size: 0.88rem;
            color: var(--c-muted);
          }
        }
      }

      .user-comments-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .comment-item {
        background: #FFFFFF;
        border: 1px solid var(--c-border-light);
        border-radius: var(--radius-sm);
        padding: 1.5rem;

        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 0.75rem;

          .stars {
            color: var(--c-gold);
            display: flex;
          }

          .comment-author {
            font-weight: 700;
            font-size: 0.92rem;
          }

          .comment-date {
            margin-right: auto;
            font-size: 0.78rem;
            color: var(--c-muted-light);
          }
        }

        .comment-body {
          font-size: 0.92rem;
          color: var(--c-dark-secondary);
          line-height: 1.7;
        }
      }
    }

    /* Related Products */
    .related-products-section {
      margin-top: 5rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.75rem;
    }

    .gold-icon {
      color: var(--c-gold);
    }

    @media (max-width: 1024px) {
      .product-showcase-grid {
        grid-template-columns: 1fr;
      }
      .related-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .care-cards-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .tabs-nav {
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .related-grid {
        grid-template-columns: 1fr;
      }
      .lens-cards-grid {
        grid-template-columns: 1fr;
      }
      .specs-summary-bar {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .purchase-actions-box {
        flex-direction: column;
        .add-cart-btn, .buy-now-btn, .quantity-controller {
          width: 100%;
        }
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private notificationService = inject(NotificationService);

  product = signal<Product | undefined>(undefined);
  relatedProducts = signal<Product[]>([]);
  activeImage = signal<string | null>(null);
  selectedColor = signal<ProductColor>({ name: '', nameAr: '', code: '' });
  selectedLens = signal<LensOption>(this.productService.lensOptions[0]);
  quantity = signal<number>(1);
  activeTab = signal<'story' | 'specs' | 'care' | 'reviews'>('story');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        const p = this.productService.getProductById(id);
        if (p) {
          this.product.set(p);
          this.activeImage.set(p.images[0]);
          this.selectedColor.set(p.colors[0]);
          this.selectedLens.set(this.productService.lensOptions[0]);
          this.quantity.set(1);
          this.relatedProducts.set(this.productService.getRelatedProducts(p.id, 4));

          // scroll to top
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          this.router.navigate(['/products']);
        }
      }
    });
  }

  setActiveImage(img: string): void {
    this.activeImage.set(img);
  }

  selectColor(c: ProductColor): void {
    this.selectedColor.set(c);
  }

  selectLens(lens: LensOption): void {
    this.selectedLens.set(lens);
  }

  increaseQty(): void {
    this.quantity.update((q) => q + 1);
  }

  decreaseQty(): void {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  calculatedPrice(): number {
    const p = this.product();
    if (!p) return 0;
    return p.price + (this.selectedLens()?.price || 0);
  }

  calculatedTotal(): number {
    return this.calculatedPrice() * this.quantity();
  }

  isInWishlist(id: string): boolean {
    return this.wishlistService.isInWishlist(id);
  }

  toggleWishlist(product: Product): void {
    const added = this.wishlistService.toggleWishlist(product);
    if (added) {
      this.notificationService.success(`تمت إضافة "${product.nameAr}" إلى المفضلة`);
    } else {
      this.notificationService.info(`تمت إزالة "${product.nameAr}" من المفضلة`);
    }
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(
      product,
      this.selectedColor(),
      this.quantity(),
      this.selectedLens()
    );
    this.notificationService.success(`تمت إضافة ${this.quantity()} × "${product.nameAr}" إلى السلة`);
  }

  onBuyNow(product: Product): void {
    this.cartService.addToCart(
      product,
      this.selectedColor(),
      this.quantity(),
      this.selectedLens()
    );
    this.router.navigate(['/cart'], { queryParams: { checkout: 'true' } });
  }
}

