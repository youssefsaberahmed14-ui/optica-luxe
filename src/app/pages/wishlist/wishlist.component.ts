import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wishlist-page">
      <section class="wishlist-header">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a routerLink="/">الرئيسية</a>
            <span class="sep">/</span>
            <span class="current">المقتنيات المفضلة</span>
          </nav>
          <div class="header-content">
            <h1 class="page-title">قائمة الرغبات والمقتنيات المفضلة</h1>
            <p class="page-subtitle">احتفظ بنظاراتك المفضلة لتتسوقها في أي وقت أو قارن بين موديلاتها الأنيقة</p>
          </div>
        </div>
      </section>

      <div class="container wishlist-body">
        @if (wishlistService.items().length === 0) {
          <div class="empty-wishlist">
            <div class="empty-icon-wrap">
              <app-icon name="heart" [size]="52" class="gold-icon"></app-icon>
            </div>
            <h2>قائمة المقتنيات فارغة</h2>
            <p>لم تقم بإضافة أي قطعة إلى مفضلتك بعد. تصفح التشكيلات وانقر على رمز القلب لحفظ ما يعجبك.</p>
            <a routerLink="/products" class="btn btn-primary btn-lg">
              <span>تصفح تشكيلة النظارات</span>
              <app-icon name="arrow-left" [size]="18"></app-icon>
            </a>
          </div>
        } @else {
          <div class="wishlist-top-bar">
            <span>لديك <strong>{{ wishlistService.count() }}</strong> منتجات في قائمة رغباتك</span>
            <button (click)="clearAll()" class="btn-clear-all">
              <app-icon name="trash" [size]="15"></app-icon>
              <span>مسح القائمة بالكامل</span>
            </button>
          </div>

          <div class="wishlist-grid">
            @for (product of wishlistService.items(); track product.id) {
              <div class="wishlist-card">
                <div class="card-media">
                  <a [routerLink]="['/products', product.id]">
                    <img [src]="product.thumbnail" [alt]="product.nameAr" />
                  </a>
                  <button (click)="removeItem(product.id)" class="remove-btn" title="حذف من المفضلة" aria-label="حذف">
                    <app-icon name="close" [size]="16"></app-icon>
                  </button>
                </div>

                <div class="card-info">
                  <span class="card-brand">{{ product.brandAr }}</span>
                  <h3 class="card-title">
                    <a [routerLink]="['/products', product.id]">{{ product.nameAr }}</a>
                  </h3>

                  <div class="card-price-row">
                    <span class="price">{{ product.price }} ج.م</span>
                    @if (product.oldPrice) {
                      <span class="old-price">{{ product.oldPrice }} ج.م</span>
                    }
                  </div>

                  <div class="card-actions">
                    <button (click)="moveToCart(product)" class="btn btn-primary w-100">
                      <app-icon name="cart" [size]="16"></app-icon>
                      <span>نقل إلى حقيبة التسوق</span>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wishlist-header {
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border);
      padding: 2.5rem 0;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--c-muted);
      margin-bottom: 0.75rem;

      a {
        color: var(--c-dark-secondary);
        &:hover { color: var(--c-gold-hover); }
      }

      .current {
        color: var(--c-dark);
        font-weight: 700;
      }
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--c-dark);
      margin-bottom: 0.35rem;
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--c-muted);
    }

    .wishlist-body {
      padding: 3.5rem 1.5rem;
    }

    .empty-wishlist {
      text-align: center;
      padding: 5rem 1rem;
      max-width: 500px;
      margin: 0 auto;

      .empty-icon-wrap {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background-color: var(--c-gold-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem auto;
      }

      h2 {
        font-size: 1.8rem;
        margin-bottom: 0.75rem;
      }

      p {
        font-size: 0.95rem;
        color: var(--c-muted);
        line-height: 1.7;
        margin-bottom: 2rem;
      }
    }

    .wishlist-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--c-border);

      span {
        font-size: 0.95rem;
        color: var(--c-muted);

        strong {
          color: var(--c-dark);
        }
      }

      .btn-clear-all {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--c-danger);
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.75rem;
    }

    .wishlist-card {
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
      }

      .card-media {
        aspect-ratio: 1 / 1;
        background-color: #F8F6F2;
        overflow: hidden;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        &:hover img {
          transform: scale(1.06);
        }

        .remove-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid var(--c-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--c-muted);
          transition: all 0.2s;

          &:hover {
            color: var(--c-danger);
            background: #FFFFFF;
          }
        }
      }

      .card-info {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        flex: 1;

        .card-brand {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--c-gold-dark);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;

          a {
            color: var(--c-dark);
            &:hover { color: var(--c-gold-hover); }
          }
        }

        .card-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          margin-bottom: 1.25rem;

          .price {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--c-dark);
          }

          .old-price {
            font-size: 0.85rem;
            color: var(--c-muted-light);
            text-decoration: line-through;
          }
        }

        .card-actions {
          margin-top: auto;
        }
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .w-100 {
      width: 100%;
    }

    @media (max-width: 1024px) {
      .wishlist-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .wishlist-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WishlistComponent {
  wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  removeItem(id: string): void {
    this.wishlistService.removeFromWishlist(id);
    this.notificationService.info('تمت إزالة المنتج من المفضلة');
  }

  clearAll(): void {
    this.wishlistService.clearWishlist();
    this.notificationService.info('تم مسح قائمة المفضلة بالكامل');
  }

  moveToCart(product: Product): void {
    this.cartService.addToCart(product, product.colors[0], 1);
    this.wishlistService.removeFromWishlist(product.id);
    this.notificationService.success(`تم نقل "${product.nameAr}" إلى حقيبة التسوق`);
  }
}

