import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LensOption, Product, ProductColor } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductService } from '../../../core/services/product.service';
import { QuickViewService } from '../../../core/services/quick-view.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (quickViewService.activeProduct(); as product) {
      <div class="modal-backdrop" (click)="close()">
        <div class="modal-card animate-fade-in" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button (click)="close()" class="modal-close-btn" aria-label="إغلاق">
            <app-icon name="close" [size]="20"></app-icon>
          </button>

          <div class="modal-content-grid">
            <!-- Left: Gallery Preview -->
            <div class="modal-gallery">
              <div class="main-image-wrap">
                <img [src]="selectedImage() || product.images[0]" [alt]="product.nameAr" />
              </div>
              @if (product.images.length > 1) {
                <div class="thumb-strip">
                  @for (img of product.images; track img) {
                    <button
                      (click)="selectImage(img)"
                      class="thumb-btn"
                      [class.active]="(selectedImage() || product.images[0]) === img"
                    >
                      <img [src]="img" [alt]="product.nameAr" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right: Details & Purchase -->
            <div class="modal-details">
              <div class="brand-sku-row">
                <span class="brand-tag">{{ product.brandAr }}</span>
                <span class="sku-tag">كود: {{ product.sku }}</span>
              </div>

              <h2 class="product-title">{{ product.nameAr }}</h2>
              <p class="product-en-name font-brand">{{ product.name }}</p>

              <!-- Rating & Reviews -->
              <div class="rating-row">
                <div class="stars">
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                  <app-icon name="star-filled" [size]="15"></app-icon>
                </div>
                <span class="rating-score">{{ product.rating }}</span>
                <span class="review-count">({{ product.reviewCount }} تقييم موثق)</span>
                <span class="stock-badge">
                  <app-icon name="check" [size]="13"></app-icon>
                  متوفر بالمخزون
                </span>
              </div>

              <!-- Price Box -->
              <div class="price-box">
                <span class="current-price">{{ product.price }} <span class="currency">ج.م</span></span>
                @if (product.oldPrice) {
                  <span class="old-price">{{ product.oldPrice }} ج.م</span>
                  <span class="badge badge-sale">وفر {{ product.discountPercent }}%</span>
                }
              </div>

              <p class="short-desc">{{ product.descriptionAr }}</p>

              <!-- Color Selector -->
              @if (product.colors && product.colors.length > 0) {
                <div class="option-block">
                  <label class="option-label">
                    اللون المختار:
                    <strong>{{ selectedColor()?.nameAr || product.colors[0].nameAr }}</strong>
                  </label>
                  <div class="colors-list">
                    @for (c of product.colors; track c.code) {
                      <button
                        (click)="selectColor(c)"
                        class="color-pill"
                        [class.active]="(selectedColor() || product.colors[0]).code === c.code"
                      >
                        <span class="dot" [style.background-color]="c.code"></span>
                        <span>{{ c.nameAr }}</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Dimensions Info -->
              <div class="dimensions-chips">
                <span class="dim-chip">عرض العدسة: {{ product.dimensions.lensWidth }} مم</span>
                <span class="dim-chip">جسر الأنف: {{ product.dimensions.bridgeWidth }} مم</span>
                <span class="dim-chip">طول الذراع: {{ product.dimensions.templeLength }} مم</span>
              </div>

              <!-- Lens Option Selector -->
              <div class="option-block">
                <label class="option-label">نوع العدسة:</label>
                <div class="lens-options-grid">
                  @for (lens of productService.lensOptions; track lens.id) {
                    <div
                      class="lens-card"
                      [class.active]="selectedLens()?.id === lens.id"
                      (click)="selectLens(lens)"
                    >
                      <div class="lens-header">
                        <span class="lens-title">{{ lens.nameAr }}</span>
                        <span class="lens-price">
                          {{ lens.price === 0 ? 'مجاناً' : '+ ' + lens.price + ' ج.م' }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Quantity & Add to Cart -->
              <div class="action-row">
                <div class="qty-selector">
                  <button (click)="decreaseQty()" class="qty-btn" aria-label="تقليل">
                    <app-icon name="minus" [size]="14"></app-icon>
                  </button>
                  <span class="qty-val">{{ quantity() }}</span>
                  <button (click)="increaseQty()" class="qty-btn" aria-label="زيادة">
                    <app-icon name="plus" [size]="14"></app-icon>
                  </button>
                </div>

                <button (click)="addToCart(product)" class="btn btn-primary flex-1">
                  <app-icon name="cart" [size]="18"></app-icon>
                  <span>إضافة إلى حقيبة التسوق</span>
                </button>

                <button
                  (click)="toggleWishlist(product)"
                  class="btn-icon"
                  [class.text-danger]="isInWishlist(product.id)"
                  title="إضافة للمفضلة"
                >
                  <app-icon [name]="isInWishlist(product.id) ? 'heart-filled' : 'heart'" [size]="20"></app-icon>
                </button>
              </div>

              <!-- Full Details Link -->
              <div class="full-details-link">
                <a [routerLink]="['/products', product.id]" (click)="close()">
                  <span>عرض التفاصيل الكاملة والمواصفات الحرفية</span>
                  <app-icon name="arrow-left" [size]="14"></app-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 18, 18, 0.75);
      backdrop-filter: blur(6px);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      max-width: 960px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-close-btn {
      position: absolute;
      top: 1rem;
      left: 1rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--c-surface);
      color: var(--c-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.2s;

      &:hover {
        background: var(--c-dark);
        color: #FFFFFF;
      }
    }

    .modal-content-grid {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 2rem;
      padding: 2.5rem;
    }

    /* Gallery */
    .modal-gallery {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image-wrap {
      aspect-ratio: 1 / 1;
      background-color: #F8F6F2;
      border-radius: var(--radius-sm);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .thumb-strip {
      display: flex;
      gap: 0.6rem;

      .thumb-btn {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-sm);
        border: 2px solid transparent;
        overflow: hidden;
        cursor: pointer;
        background: #F8F6F2;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.active {
          border-color: var(--c-gold);
        }
      }
    }

    /* Details */
    .modal-details {
      display: flex;
      flex-direction: column;
    }

    .brand-sku-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      .brand-tag {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--c-gold-dark);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .sku-tag {
        font-size: 0.78rem;
        color: var(--c-muted);
      }
    }

    .product-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--c-dark);
      margin-bottom: 0.2rem;
    }

    .product-en-name {
      font-size: 0.95rem;
      color: var(--c-muted);
      margin-bottom: 0.75rem;
    }

    .rating-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      margin-bottom: 1rem;

      .stars {
        display: flex;
        color: var(--c-gold);
      }

      .rating-score {
        font-weight: 700;
      }

      .review-count {
        color: var(--c-muted);
      }

      .stock-badge {
        margin-right: auto;
        color: var(--c-success);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }

    .price-box {
      display: flex;
      align-items: baseline;
      gap: 0.8rem;
      padding: 0.85rem 1rem;
      background-color: var(--c-surface-soft);
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;

      .current-price {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--c-dark);

        .currency {
          font-size: 0.95rem;
          color: var(--c-muted);
        }
      }

      .old-price {
        font-size: 0.95rem;
        color: var(--c-muted-light);
        text-decoration: line-through;
      }
    }

    .short-desc {
      font-size: 0.9rem;
      color: var(--c-muted);
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }

    .option-block {
      margin-bottom: 1.25rem;

      .option-label {
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        display: block;

        strong {
          color: var(--c-gold-dark);
        }
      }
    }

    .colors-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      .color-pill {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        background: #FFFFFF;
        cursor: pointer;
        transition: all 0.2s;

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        &.active {
          border-color: var(--c-dark);
          background-color: var(--c-surface-soft);
          font-weight: 700;
        }
      }
    }

    .dimensions-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;

      .dim-chip {
        background-color: var(--c-surface);
        padding: 0.3rem 0.6rem;
        border-radius: 3px;
        font-size: 0.75rem;
        color: var(--c-dark-secondary);
      }
    }

    .lens-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;

      .lens-card {
        border: 1px solid var(--c-border);
        padding: 0.55rem 0.75rem;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--c-gold);
        }

        &.active {
          border-color: var(--c-gold);
          background-color: var(--c-gold-light);
        }

        .lens-header {
          display: flex;
          flex-direction: column;

          .lens-title {
            font-size: 0.78rem;
            font-weight: 600;
          }

          .lens-price {
            font-size: 0.72rem;
            color: var(--c-gold-dark);
            font-weight: 700;
          }
        }
      }
    }

    .action-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.25rem;
      margin-bottom: 1rem;
    }

    .qty-selector {
      display: flex;
      align-items: center;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      overflow: hidden;

      .qty-btn {
        width: 38px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #FFFFFF;

        &:hover {
          background-color: var(--c-surface);
        }
      }

      .qty-val {
        padding: 0 0.85rem;
        font-size: 0.95rem;
        font-weight: 700;
      }
    }

    .flex-1 {
      flex: 1;
    }

    .text-danger {
      color: var(--c-danger) !important;
    }

    .full-details-link {
      text-align: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--c-border-light);

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--c-gold-dark);

        &:hover {
          color: var(--c-dark);
        }
      }
    }

    @media (max-width: 768px) {
      .modal-content-grid {
        grid-template-columns: 1fr;
        padding: 1.5rem;
        gap: 1.5rem;
      }
      .lens-options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class QuickViewModalComponent {
  quickViewService = inject(QuickViewService);
  productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private notificationService = inject(NotificationService);

  selectedImage = signal<string | null>(null);
  selectedColor = signal<ProductColor | null>(null);
  selectedLens = signal<LensOption | null>(this.productService.lensOptions[0]);
  quantity = signal<number>(1);

  close(): void {
    this.quickViewService.close();
    this.selectedImage.set(null);
    this.selectedColor.set(null);
    this.quantity.set(1);
  }

  selectImage(img: string): void {
    this.selectedImage.set(img);
  }

  selectColor(color: ProductColor): void {
    this.selectedColor.set(color);
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

  isInWishlist(id: string): boolean {
    return this.wishlistService.isInWishlist(id);
  }

  toggleWishlist(product: Product): void {
    const added = this.wishlistService.toggleWishlist(product);
    if (added) {
      this.notificationService.success(`تمت إضافة "${product.nameAr}" إلى قائمة الرغبات`);
    } else {
      this.notificationService.info(`تمت إزالة "${product.nameAr}" من قائمة الرغبات`);
    }
  }

  addToCart(product: Product): void {
    const color = this.selectedColor() || product.colors[0];
    const lens = this.selectedLens() || undefined;
    this.cartService.addToCart(product, color, this.quantity(), lens);
    this.notificationService.success(`تمت إضافة ${this.quantity()} × "${product.nameAr}" إلى السلة`);
    this.close();
  }
}

