import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuickViewService } from '../../../core/services/quick-view.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="product-card" [class.list-layout]="isListView">
      <!-- Media Box -->
      <div class="product-media">
        <!-- Floating Badges -->
        <div class="badge-stack">
          @if (product.discountPercent && product.discountPercent > 0) {
            <span class="badge badge-sale">خصم {{ product.discountPercent }}%</span>
          }
          @if (product.isNew) {
            <span class="badge badge-new">جديد</span>
          }
          @if (product.material === 'titanium') {
            <span class="badge badge-gold">تيتانيوم نقي</span>
          }
        </div>

        <!-- Wishlist Floating Button -->
        <button
          (click)="onToggleWishlist($event)"
          class="wishlist-btn"
          [class.active]="isInWishlist"
          [attr.aria-label]="isInWishlist ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'"
          title="إضافة للمفضلة"
        >
          <app-icon [name]="isInWishlist ? 'heart-filled' : 'heart'" [size]="18"></app-icon>
        </button>

        <!-- Product Image Anchor -->
        <a [routerLink]="['/products', product.id]" class="image-wrapper">
          <img
            [src]="currentImage"
            [alt]="product.nameAr"
            loading="lazy"
            class="main-img"
            (mouseenter)="onHoverImage(true)"
            (mouseleave)="onHoverImage(false)"
          />
        </a>

        <!-- Quick View Overlay Action -->
        <button (click)="onOpenQuickView($event)" class="quick-view-btn" aria-label="نظرة سريعة">
          <app-icon name="eye" [size]="16"></app-icon>
          <span>نظرة سريعة</span>
        </button>
      </div>

      <!-- Info Box -->
      <div class="product-info">
        <!-- Brand & Rating row -->
        <div class="brand-rating-row">
          <span class="product-brand">{{ product.brandAr }}</span>
          <div class="rating-box" title="{{ product.rating }} من 5">
            <app-icon name="star-filled" [size]="13"></app-icon>
            <span class="rating-num">{{ product.rating }}</span>
            <span class="rating-count">({{ product.reviewCount }})</span>
          </div>
        </div>

        <!-- Title -->
        <h3 class="product-title">
          <a [routerLink]="['/products', product.id]">{{ product.nameAr }}</a>
        </h3>

        <!-- Subtitle Specs: Shape & Material -->
        <div class="product-specs-chips">
          <span>{{ product.shapeAr }}</span>
          <span class="dot">•</span>
          <span>{{ product.materialAr }}</span>
        </div>

        <!-- Color Swatches -->
        @if (product.colors && product.colors.length > 0) {
          <div class="color-swatches">
            @for (color of product.colors; track color.name) {
              <span
                class="swatch-circle"
                [style.background-color]="color.code"
                [title]="color.nameAr"
                [class.selected]="selectedColorCode === color.code"
                (click)="selectColor(color.code, $event)"
              ></span>
            }
          </div>
        }

        <!-- Price & Cart Row -->
        <div class="price-action-row">
          <div class="price-group">
            <span class="current-price">{{ product.price }} <span class="currency">ج.م</span></span>
            @if (product.oldPrice) {
              <span class="old-price">{{ product.oldPrice }} ج.م</span>
            }
          </div>

          <!-- Add to Cart Button -->
          <button (click)="onAddToCart($event)" class="add-to-cart-btn" title="أضف إلى السلة" aria-label="أضف للسلة">
            <app-icon name="cart" [size]="17"></app-icon>
            <span class="btn-text">إضافة للسلة</span>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all var(--transition-smooth);

      &:hover {
        border-color: var(--c-gold);
        box-shadow: var(--shadow-hover);
        transform: translateY(-4px);

        .quick-view-btn {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }

    /* Media Box */
    .product-media {
      position: relative;
      background-color: #F8F6F2;
      overflow: hidden;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .product-card:hover .main-img {
      transform: scale(1.06);
    }

    .badge-stack {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 2;
    }

    .wishlist-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      border: 1px solid var(--c-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--c-dark);
      z-index: 2;
      transition: all 0.2s ease;

      &:hover {
        background: #FFFFFF;
        color: var(--c-danger);
        transform: scale(1.1);
      }

      &.active {
        color: var(--c-danger);
        background: #FFFFFF;
        border-color: rgba(192, 57, 43, 0.3);
      }
    }

    .quick-view-btn {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      background: rgba(18, 18, 18, 0.92);
      color: #FFFFFF;
      padding: 0.55rem 1.25rem;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 3;

      &:hover {
        background: var(--c-gold);
        color: #121212;
      }
    }

    /* Product Info */
    .product-info {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .brand-rating-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .product-brand {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--c-gold-dark);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .rating-box {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.78rem;
      color: var(--c-muted);

      .rating-num {
        font-weight: 700;
        color: var(--c-dark);
      }
    }

    .product-title {
      font-size: 1.02rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 0.45rem;

      a {
        color: var(--c-dark);
        transition: color 0.2s;

        &:hover {
          color: var(--c-gold-hover);
        }
      }
    }

    .product-specs-chips {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--c-muted);
      margin-bottom: 0.75rem;

      .dot {
        color: var(--c-border);
      }
    }

    .color-swatches {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-bottom: 1rem;
    }

    .swatch-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: scale(1.2);
      }

      &.selected {
        outline: 2px solid var(--c-dark);
        outline-offset: 2px;
      }
    }

    .price-action-row {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--c-border-light);
    }

    .price-group {
      display: flex;
      flex-direction: column;

      .current-price {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--c-dark);

        .currency {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--c-muted);
        }
      }

      .old-price {
        font-size: 0.82rem;
        color: var(--c-muted-light);
        text-decoration: line-through;
      }
    }

    .add-to-cart-btn {
      background-color: var(--c-dark);
      color: #FFFFFF;
      padding: 0.55rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      transition: all 0.25s ease;

      &:hover {
        background-color: var(--c-gold-hover);
        color: #FFFFFF;
        transform: translateY(-2px);
      }
    }

    /* List Layout Variant */
    .product-card.list-layout {
      flex-direction: row;

      .product-media {
        width: 280px;
        min-width: 280px;
        aspect-ratio: auto;
      }

      .product-info {
        padding: 1.5rem;
      }

      .product-title {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 640px) {
      .product-card.list-layout {
        flex-direction: column;

        .product-media {
          width: 100%;
          min-width: auto;
          aspect-ratio: 1 / 1;
        }
      }

      .btn-text {
        display: none;
      }

      .add-to-cart-btn {
        padding: 0.55rem 0.75rem;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() isListView = false;

  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private notificationService = inject(NotificationService);
  private quickViewService = inject(QuickViewService);

  isHovered = false;
  selectedColorCode: string = '';

  get isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  get currentImage(): string {
    if (this.isHovered && this.product.images.length > 1) {
      return this.product.images[1];
    }
    return this.product.thumbnail || this.product.images[0];
  }

  onHoverImage(hover: boolean): void {
    this.isHovered = hover;
  }

  selectColor(code: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedColorCode = code;
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const added = this.wishlistService.toggleWishlist(this.product);
    if (added) {
      this.notificationService.success(`تمت إضافة "${this.product.nameAr}" إلى قائمة رغباتك`);
    } else {
      this.notificationService.info(`تمت إزالة "${this.product.nameAr}" من قائمة الرغبات`);
    }
  }

  onOpenQuickView(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.quickViewService.open(this.product);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const chosenColor = this.product.colors.find((c) => c.code === this.selectedColorCode) || this.product.colors[0];
    this.cartService.addToCart(this.product, chosenColor, 1);
    this.notificationService.success(`تمت إضافة "${this.product.nameAr}" إلى حقيبة التسوق الفاخرة`);
  }
}

