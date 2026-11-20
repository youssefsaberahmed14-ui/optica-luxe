import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cartService.isDrawerOpen()) {
      <!-- Backdrop -->
      <div class="drawer-backdrop" (click)="close()"></div>

      <!-- Drawer Content -->
      <aside class="cart-drawer-panel">
        <!-- Header -->
        <div class="drawer-header">
          <div class="title-wrap">
            <app-icon name="cart" [size]="22" class="gold-icon"></app-icon>
            <h3>حقيبة التسوق الفاخرة</h3>
            <span class="count-pill">({{ cartService.totalItemCount() }})</span>
          </div>
          <button (click)="close()" class="btn-icon" aria-label="إغلاق السلة">
            <app-icon name="close" [size]="18"></app-icon>
          </button>
        </div>

        <!-- Free shipping bar -->
        <div class="shipping-meter">
          @if (cartService.summary().subtotal >= 500) {
            <div class="meter-text success">
              <app-icon name="check" [size]="15"></app-icon>
              <span>مبروك! لقد حصلت على شحن مجاني فاخر ومؤمّن بالكامل</span>
            </div>
            <div class="meter-bar">
              <div class="fill success" style="width: 100%"></div>
            </div>
          } @else {
            <div class="meter-text">
              <span>أضف بقيمة <strong>{{ 500 - cartService.summary().subtotal }} ج.م</strong> إضافية للحصول على شحن مجاني</span>
            </div>
            <div class="meter-bar">
              <div class="fill" [style.width.%]="(cartService.summary().subtotal / 500) * 100"></div>
            </div>
          }
        </div>

        <!-- Body: Cart Items -->
        <div class="drawer-body">
          @if (cartService.items().length === 0) {
            <div class="empty-cart-state">
              <div class="empty-icon-wrap">
                <app-icon name="glasses" [size]="48" class="gold-icon"></app-icon>
              </div>
              <h4>حقيبة التسوق فارغة</h4>
              <p>لم تقم بإضافة أي نظارة أو إطار فاخر بعد. استكشف مجموعتنا الحصرية الآن.</p>
              <button (click)="goToCatalog()" class="btn btn-primary">
                <span>استكشف النظارات الفاخرة</span>
                <app-icon name="arrow-left" [size]="16"></app-icon>
              </button>
            </div>
          } @else {
            <div class="cart-items-list">
              @for (item of cartService.items(); track item.id) {
                <div class="cart-item-row">
                  <!-- Thumbnail -->
                  <div class="item-img-wrapper">
                    <img [src]="item.product.thumbnail" [alt]="item.product.nameAr" />
                  </div>

                  <!-- Details -->
                  <div class="item-details">
                    <div class="item-top">
                      <span class="item-brand">{{ item.product.brandAr }}</span>
                      <button (click)="removeItem(item.id)" class="item-remove-btn" title="حذف" aria-label="حذف">
                        <app-icon name="trash" [size]="16"></app-icon>
                      </button>
                    </div>

                    <h4 class="item-title">
                      <a [routerLink]="['/products', item.product.id]" (click)="close()">
                        {{ item.product.nameAr }}
                      </a>
                    </h4>

                    <div class="item-color-chip">
                      <span class="color-dot" [style.background-color]="item.selectedColor.code"></span>
                      <span>{{ item.selectedColor.nameAr }}</span>
                      @if (item.lensOption && item.lensOption.price > 0) {
                        <span class="lens-tag">+ {{ item.lensOption.nameAr }}</span>
                      }
                    </div>

                    <!-- Price & Qty -->
                    <div class="item-bottom">
                      <div class="qty-control">
                        <button (click)="changeQty(item.id, item.quantity - 1)" class="qty-btn" aria-label="تقليل">
                          <app-icon name="minus" [size]="12"></app-icon>
                        </button>
                        <span class="qty-num">{{ item.quantity }}</span>
                        <button (click)="changeQty(item.id, item.quantity + 1)" class="qty-btn" aria-label="زيادة">
                          <app-icon name="plus" [size]="12"></app-icon>
                        </button>
                      </div>

                      <div class="item-price">
                        <span>{{ item.total }} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer / Checkout Area -->
        @if (cartService.items().length > 0) {
          <div class="drawer-footer">
            <!-- Promo code input -->
            <div class="coupon-box">
              <input
                type="text"
                [(ngModel)]="couponInput"
                placeholder="رمز الكوبون (مثال: LUXE2026)"
                class="coupon-input"
              />
              <button (click)="applyCoupon()" class="btn btn-outline-gold btn-sm">تطبيق</button>
            </div>

            @if (cartService.appliedCoupon()) {
              <div class="applied-coupon-pill">
                <span>تم تفعيل الكوبون: <strong>{{ cartService.appliedCoupon() }}</strong> (-{{ cartService.summary().discountAmount }} ج.م)</span>
                <button (click)="removeCoupon()" class="coupon-remove">&times;</button>
              </div>
            }

            <!-- Summary Breakdown -->
            <div class="summary-breakdown">
              <div class="summary-line">
                <span>المجموع الفرعي</span>
                <span>{{ cartService.summary().subtotal }} ج.م</span>
              </div>

              @if (cartService.summary().discountAmount > 0) {
                <div class="summary-line discount">
                  <span>الخصم المطبق</span>
                  <span>-{{ cartService.summary().discountAmount }} ج.م</span>
                </div>
              }

              <div class="summary-line">
                <span>الشحن والتوصيل</span>
                @if (cartService.summary().shipping === 0) {
                  <span class="free-shipping-tag">مجاني</span>
                } @else {
                  <span>{{ cartService.summary().shipping }} ج.م</span>
                }
              </div>

              <div class="summary-line total-line">
                <span>الإجمالي شامل الضريبة</span>
                <span class="total-amount">{{ cartService.summary().total }} ج.م</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="drawer-actions">
              <button (click)="proceedToCheckout()" class="btn btn-primary w-100">
                <span>إتمام الطلب والشراء</span>
                <app-icon name="arrow-left" [size]="17"></app-icon>
              </button>
              <button (click)="viewFullCart()" class="btn btn-outline w-100 mt-2">
                <span>عرض تفاصيل الحقيبة كاملة</span>
              </button>
            </div>
          </div>
        }
      </aside>
    }
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 18, 18, 0.65);
      backdrop-filter: blur(4px);
      z-index: 150;
      animation: fadeIn 0.3s ease;
    }

    .cart-drawer-panel {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      z-index: 151;
      display: flex;
      flex-direction: column;
      box-shadow: 10px 0 35px rgba(0, 0, 0, 0.2);
      animation: slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drawer-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--c-border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .count-pill {
          color: var(--c-gold-dark);
          font-size: 0.9rem;
          font-weight: 700;
        }
      }
    }

    .shipping-meter {
      padding: 0.85rem 1.5rem;
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border-light);

      .meter-text {
        font-size: 0.82rem;
        color: var(--c-dark-secondary);
        margin-bottom: 0.4rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;

        &.success {
          color: var(--c-success);
          font-weight: 600;
        }

        strong {
          color: var(--c-gold-dark);
        }
      }

      .meter-bar {
        height: 5px;
        background-color: var(--c-border);
        border-radius: var(--radius-full);
        overflow: hidden;

        .fill {
          height: 100%;
          background: linear-gradient(90deg, #DFCAAE, var(--c-gold));
          transition: width 0.4s ease;

          &.success {
            background: var(--c-success);
          }
        }
      }
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }

    .empty-cart-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      padding: 2rem 1rem;

      .empty-icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: var(--c-gold-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.25rem;
      }

      h4 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.88rem;
        color: var(--c-muted);
        line-height: 1.6;
        margin-bottom: 1.75rem;
        max-width: 280px;
      }
    }

    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cart-item-row {
      display: flex;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--c-border-light);

      .item-img-wrapper {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-sm);
        background-color: #F7F5F0;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .item-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.2rem;
      }

      .item-brand {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--c-gold-dark);
        text-transform: uppercase;
      }

      .item-remove-btn {
        color: var(--c-muted-light);
        transition: color 0.2s;

        &:hover {
          color: var(--c-danger);
        }
      }

      .item-title {
        font-size: 0.92rem;
        font-weight: 700;
        margin-bottom: 0.35rem;

        a {
          color: var(--c-dark);
          &:hover {
            color: var(--c-gold-hover);
          }
        }
      }

      .item-color-chip {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
        color: var(--c-muted);
        margin-bottom: 0.6rem;

        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .lens-tag {
          background-color: var(--c-surface);
          padding: 0.1rem 0.4rem;
          border-radius: 3px;
          font-size: 0.72rem;
        }
      }

      .item-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .qty-control {
        display: flex;
        align-items: center;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        overflow: hidden;

        .qty-btn {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          color: var(--c-dark);

          &:hover {
            background-color: var(--c-surface);
          }
        }

        .qty-num {
          padding: 0 0.5rem;
          font-size: 0.82rem;
          font-weight: 700;
        }
      }

      .item-price {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--c-dark);
      }
    }

    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--c-border);
      background-color: var(--c-surface-soft);
    }

    .coupon-box {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;

      .coupon-input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
        outline: none;

        &:focus {
          border-color: var(--c-gold);
        }
      }

      .btn-sm {
        padding: 0.5rem 0.85rem;
        font-size: 0.85rem;
      }
    }

    .applied-coupon-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--c-gold-light);
      border: 1px solid rgba(197, 168, 128, 0.4);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.78rem;
      color: var(--c-gold-dark);
      margin-bottom: 0.75rem;

      .coupon-remove {
        font-size: 1.1rem;
        cursor: pointer;
        color: var(--c-muted);

        &:hover {
          color: var(--c-danger);
        }
      }
    }

    .summary-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.25rem;

      .summary-line {
        display: flex;
        justify-content: space-between;
        font-size: 0.88rem;
        color: var(--c-muted);

        &.discount {
          color: var(--c-danger);
          font-weight: 600;
        }

        .free-shipping-tag {
          color: var(--c-success);
          font-weight: 700;
        }

        &.total-line {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--c-dark);
          padding-top: 0.6rem;
          border-top: 1px solid var(--c-border);

          .total-amount {
            color: var(--c-gold-dark);
          }
        }
      }
    }

    .drawer-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .w-100 {
      width: 100%;
    }

    .mt-2 {
      margin-top: 0.5rem;
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  couponInput: string = '';

  close(): void {
    this.cartService.closeDrawer();
  }

  changeQty(itemId: string, newQty: number): void {
    this.cartService.updateQuantity(itemId, newQty);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
    this.notificationService.info('تم حذف المنتج من حقيبة التسوق');
  }

  applyCoupon(): void {
    if (!this.couponInput.trim()) return;
    const res = this.cartService.applyCoupon(this.couponInput);
    if (res.success) {
      this.notificationService.success(res.message);
      this.couponInput = '';
    } else {
      this.notificationService.error(res.message);
    }
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.notificationService.info('تمت إزالة الكوبون');
  }

  goToCatalog(): void {
    this.close();
    this.router.navigate(['/products']);
  }

  viewFullCart(): void {
    this.close();
    this.router.navigate(['/cart']);
  }

  proceedToCheckout(): void {
    this.close();
    this.router.navigate(['/cart'], { queryParams: { checkout: 'true' } });
  }
}

