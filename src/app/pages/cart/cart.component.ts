import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

import { OrderApiService } from '../../core/services/order-api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cart-page">
      <!-- Breadcrumb -->
      <section class="cart-header">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a routerLink="/">الرئيسية</a>
            <span class="sep">/</span>
            <span class="current">حقيبة المشتريات الفاخرة</span>
          </nav>
          <h1 class="page-title">حقيبة التسوق ومراجعة الطلب</h1>
        </div>
      </section>

      <div class="container cart-body">
        @if (cartService.items().length === 0 && !orderSuccess()) {
          <!-- Empty Cart -->
          <div class="empty-cart-view">
            <div class="empty-icon-box">
              <app-icon name="glasses" [size]="56" class="gold-icon"></app-icon>
            </div>
            <h2>حقيبة التسوق فارغة حالياً</h2>
            <p>لم تقم باختيار أي نظارة أو إطار فاخر بعد. استكشف تشكيلتنا الأيقونية الحصرية وابدأ التسوق الآن.</p>
            <a routerLink="/products" class="btn btn-primary btn-lg">
              <span>استكشف النظارات الفاخرة</span>
              <app-icon name="arrow-left" [size]="18"></app-icon>
            </a>
          </div>
        } @else if (orderSuccess()) {
          <!-- Order Placed Success Screen -->
          <div class="order-success-view animate-fade-in">
            <div class="success-icon-box">
              <app-icon name="check" [size]="48"></app-icon>
            </div>
            <span class="success-tag">تم تأكيد الطلب بنجاح</span>
            <h2>شكراً لاختيارك أوبتيكا لاكشري</h2>
            <p class="success-lead">
              تم استلام طلبك رقم <strong class="order-id">{{ orderId() }}</strong> وسيتولى مستشارك البصري الخاص تجهيز النظارة وفحصها يدوياً قبل تغليفها الملكي.
            </p>

            <div class="order-summary-card">
              <h3>بيانات استلام الشحنة:</h3>
              <div class="summary-details">
                <div class="detail-row">
                  <span class="lbl">اسم المستلم:</span>
                  <span class="val">{{ checkoutForm.fullName }}</span>
                </div>
                <div class="detail-row">
                  <span class="lbl">المدينة والعنوان:</span>
                  <span class="val">{{ checkoutForm.city }} - {{ checkoutForm.address }}</span>
                </div>
                <div class="detail-row">
                  <span class="lbl">طريقة الدفع:</span>
                  <span class="val">الدفع عند الاستلام (Cash on Delivery)</span>
                </div>
                <div class="detail-row">
                  <span class="lbl">المبلغ الإجمالي عند الاستلام:</span>
                  <span class="val highlight">{{ orderPaidTotal() }} ج.م</span>
                </div>
              </div>

              @if (orderTrackingToken()) {
                <div class="tracking-box mt-3 p-3 bg-soft border-gold" style="background: #faf8f5; border: 1px dashed #c5a059; border-radius: 6px; text-align: center;">
                  <span style="font-size: 0.85rem; color: #666; display: block; margin-bottom: 0.35rem;">رمز التتبع السري والآمن لشحنتك:</span>
                  <code style="font-size: 0.95rem; font-weight: bold; color: #111; letter-spacing: 1px; word-break: break-all;">{{ orderTrackingToken() }}</code>
                  <small style="display: block; font-size: 0.75rem; color: #888; margin-top: 0.35rem;">يرجى حفظ هذا الرمز للاستعلام عن مسار الشحنة بأمان تام.</small>
                </div>
              }
            </div>

            <div class="success-actions">
              <a routerLink="/products" class="btn btn-primary">
                <span>متابعة التسوق</span>
              </a>
              <a routerLink="/" class="btn btn-outline">
                <span>العودة للرئيسية</span>
              </a>
            </div>
          </div>
        } @else {
          <!-- Active Cart Layout -->
          <div class="cart-layout-grid">
            <!-- Left: Items Table / List -->
            <div class="cart-table-wrapper">
              <div class="cart-table-header">
                <span class="col-prod">المنتج والمواصفات</span>
                <span class="col-price">السعر</span>
                <span class="col-qty">الكمية</span>
                <span class="col-total">الإجمالي</span>
                <span class="col-act"></span>
              </div>

              <div class="cart-rows-list">
                @for (item of cartService.items(); track item.id) {
                  <div class="cart-table-row">
                    <!-- Product info -->
                    <div class="product-cell">
                      <div class="prod-thumb">
                        <img [src]="item.product.thumbnail" [alt]="item.product.nameAr" />
                      </div>
                      <div class="prod-text">
                        <span class="brand-tag">{{ item.product.brandAr }}</span>
                        <h4 class="prod-title">
                          <a [routerLink]="['/products', item.product.id]">{{ item.product.nameAr }}</a>
                        </h4>
                        <div class="prod-options-pills">
                          <span class="color-pill">
                            <span class="dot" [style.background-color]="item.selectedColor.code"></span>
                            {{ item.selectedColor.nameAr }}
                          </span>
                          @if (item.lensOption && item.lensOption.price > 0) {
                            <span class="lens-pill">+ {{ item.lensOption.nameAr }}</span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Price -->
                    <div class="price-cell">
                      <span>{{ item.price }} ج.م</span>
                    </div>

                    <!-- Qty -->
                    <div class="qty-cell">
                      <div class="qty-ctrl">
                        <button (click)="changeQty(item.id, item.quantity - 1)" class="q-btn" aria-label="تقليل">
                          <app-icon name="minus" [size]="12"></app-icon>
                        </button>
                        <span class="q-val">{{ item.quantity }}</span>
                        <button (click)="changeQty(item.id, item.quantity + 1)" class="q-btn" aria-label="زيادة">
                          <app-icon name="plus" [size]="12"></app-icon>
                        </button>
                      </div>
                    </div>

                    <!-- Total -->
                    <div class="total-cell">
                      <span class="row-total">{{ item.total }} ج.م</span>
                    </div>

                    <!-- Actions -->
                    <div class="act-cell">
                      <button (click)="removeItem(item.id)" class="del-btn" title="حذف" aria-label="حذف">
                        <app-icon name="trash" [size]="18"></app-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Cart perks bar -->
              <div class="cart-footer-bar">
                <a routerLink="/products" class="btn btn-outline">
                  <app-icon name="arrow-right" [size]="16"></app-icon>
                  <span>متابعة التسوق وإضافة منتجات أخرى</span>
                </a>
                <button (click)="clearCart()" class="btn-clear-cart">
                  <span>إفراغ السلة</span>
                </button>
              </div>
            </div>

            <!-- Right: Order Summary Card -->
            <div class="cart-summary-sidebar">
              <div class="summary-card">
                <h3 class="summary-title">ملخص الطلب</h3>

                <!-- Coupon Section -->
                <div class="coupon-section">
                  <div class="coupon-form">
                    <input
                      type="text"
                      [(ngModel)]="couponCode"
                      placeholder="كود الخصم (مثل: LUXE2026)"
                      class="coupon-input"
                    />
                    <button (click)="applyCoupon()" class="btn btn-outline-gold">تطبيق</button>
                  </div>

                  @if (cartService.appliedCoupon()) {
                    <div class="coupon-applied-alert">
                      <span>تم تطبيق الخصم: <strong>{{ cartService.appliedCoupon() }}</strong> (-{{ cartService.summary().discountAmount }} ج.م)</span>
                      <button (click)="removeCoupon()" class="del-coupon">&times;</button>
                    </div>
                  }
                </div>

                <!-- Price Lines -->
                <div class="prices-breakdown">
                  <div class="p-line">
                    <span>المجموع الفرعي</span>
                    <span>{{ cartService.summary().subtotal }} ج.م</span>
                  </div>

                  @if (cartService.summary().discountAmount > 0) {
                    <div class="p-line discount">
                      <span>الخصم المطبق ({{ cartService.summary().couponDiscountPercent }}%)</span>
                      <span>-{{ cartService.summary().discountAmount }} ج.م</span>
                    </div>
                  }

                  <div class="p-line">
                    <span>الشحن والتوصيل</span>
                    @if (cartService.summary().shipping === 0) {
                      <span class="free-badge">مجاني بالكامل</span>
                    } @else {
                      <span>{{ cartService.summary().shipping }} ج.م</span>
                    }
                  </div>

                  <div class="p-line">
                    <span>ضريبة القيمة المضافة (15% مشمولة)</span>
                    <span>{{ cartService.summary().taxAmount }} ج.م</span>
                  </div>

                  <div class="p-line grand-total">
                    <span>المجموع الإجمالي</span>
                    <span class="total-val">{{ cartService.summary().total }} ج.م</span>
                  </div>
                </div>

                <!-- Checkout CTA -->
                <button (click)="openCheckoutModal()" class="btn btn-primary btn-lg w-100 mt-3">
                  <span>متابعة إتمام الطلب</span>
                  <app-icon name="arrow-left" [size]="18"></app-icon>
                </button>

                <!-- Secure badges -->
                <div class="security-note">
                  <app-icon name="shield-check" [size]="16" class="gold-icon"></app-icon>
                  <span>دفع آمن 100% ومشفر بأحدث بروتوكولات الأمان العالمية</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Checkout Modal -->
      @if (isCheckoutModalOpen()) {
        <div class="checkout-modal-backdrop" (click)="closeCheckoutModal()">
          <div class="checkout-modal-panel animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-top">
              <div class="m-title">
                <app-icon name="award" [size]="22" class="gold-icon"></app-icon>
                <div>
                  <h3>إتمام الطلب الفاخر والدفع</h3>
                  <span class="demo-mode-pill">طلب تجريبي للمعاينة • Demo Mode</span>
                </div>
              </div>
              <button (click)="closeCheckoutModal()" class="btn-icon" aria-label="إغلاق">
                <app-icon name="close" [size]="18"></app-icon>
              </button>
            </div>

            <form (submit)="submitOrder($event)" class="checkout-form">
              <!-- Shipping Details -->
              <div class="form-section-title">بيانات الشحن والتوصيل</div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">الاسم بالكامل *</label>
                  <input
                    type="text"
                    [(ngModel)]="checkoutForm.fullName"
                    name="fullName"
                    class="form-input"
                    placeholder="مثال: أحمد عبد الرحمن مصطفى"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">رقم الجوال *</label>
                  <input
                    type="tel"
                    [(ngModel)]="checkoutForm.phone"
                    name="phone"
                    class="form-input"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    [(ngModel)]="checkoutForm.email"
                    name="email"
                    class="form-input"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">المدينة / المحافظة *</label>
                  <select
                    [(ngModel)]="checkoutForm.city"
                    name="city"
                    class="form-select"
                    required
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="المنصورة">المنصورة</option>
                    <option value="طنطا">طنطا</option>
                    <option value="بورسعيد">بورسعيد</option>
                    <option value="شرم الشيخ">شرم الشيخ</option>
                    <option value="الغردقة">الغردقة</option>
                  </select>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                  <label class="form-label">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    [(ngModel)]="checkoutForm.address"
                    name="address"
                    class="form-input"
                    placeholder="الحي، اسم الشارع، رقم المبنى، الشقة"
                    required
                  />
                </div>
              </div>

              <!-- Payment Method Selection -->
              <div class="form-section-title mt-3">طريقة الدفع المعتمدة</div>
              <div class="payment-options-grid single-option">
                <label class="pay-option selected" style="grid-column: 1 / -1; display: flex; align-items: center; gap: 0.75rem; border: 2px solid #c5a059; background: #faf8f5; padding: 1rem; border-radius: 8px;">
                  <input
                    type="radio"
                    name="pay"
                    value="COD"
                    [(ngModel)]="checkoutForm.paymentMethod"
                    checked
                  />
                  <div>
                    <span class="pay-title" style="font-weight: 700; color: #111; display: block;">الدفع عند الاستلام (Cash on Delivery)</span>
                    <small style="display: block; color: #666; font-size: 0.8rem; margin-top: 0.2rem;">سداد إجمالي الفاتورة نقدياً لمندوب الشحن بعد استلام وفحص النظارة</small>
                  </div>
                </label>
              </div>

              <!-- Total & Submit -->
              <div class="checkout-footer-row">
                <div class="c-total">
                  <span>المبلغ المطلوب سداده:</span>
                  <strong>{{ cartService.summary().total }} ج.م</strong>
                </div>

                <button type="submit" [disabled]="isSubmitting()" class="btn btn-gold btn-lg">
                  @if (isSubmitting()) {
                    <span>جاري معالجة الطلب في الخادم...</span>
                  } @else {
                    <span>تأكيد الطلب والدفع التجريبي</span>
                    <app-icon name="check" [size]="18"></app-icon>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-header {
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
    }

    .cart-body {
      padding: 3.5rem 1.5rem;
    }

    /* Empty Cart View */
    .empty-cart-view {
      text-align: center;
      padding: 5rem 1rem;
      max-width: 540px;
      margin: 0 auto;

      .empty-icon-box {
        width: 100px;
        height: 100px;
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
        font-size: 1rem;
        color: var(--c-muted);
        line-height: 1.7;
        margin-bottom: 2rem;
      }
    }

    /* Success View */
    .order-success-view {
      text-align: center;
      max-width: 640px;
      margin: 0 auto;
      padding: 3rem 1rem;

      .success-icon-box {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background-color: var(--c-gold);
        color: #121212;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem auto;
      }

      .success-tag {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--c-gold-dark);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        display: inline-block;
        margin-bottom: 0.5rem;
      }

      h2 {
        font-size: 2.4rem;
        font-weight: 800;
        margin-bottom: 0.75rem;
      }

      .success-lead {
        font-size: 1.05rem;
        color: var(--c-muted);
        line-height: 1.7;
        margin-bottom: 2.5rem;

        .order-id {
          color: var(--c-dark);
          font-family: var(--font-brand);
          letter-spacing: 0.05em;
        }
      }

      .order-summary-card {
        background: #FFFFFF;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        padding: 2rem;
        text-align: right;
        margin-bottom: 2.5rem;

        h3 {
          font-size: 1.15rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--c-border-light);
        }

        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          .detail-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.95rem;

            .lbl {
              color: var(--c-muted);
            }

            .val {
              font-weight: 700;
              color: var(--c-dark);

              &.highlight {
                color: var(--c-gold-dark);
                font-size: 1.1rem;
              }
            }
          }
        }
      }

      .success-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
      }
    }

    /* Active Cart Layout */
    .cart-layout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3rem;
      align-items: start;
    }

    .cart-table-wrapper {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .cart-table-header {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1.2fr 1fr 40px;
      padding: 1rem 1.5rem;
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--c-muted);
    }

    .cart-rows-list {
      display: flex;
      flex-direction: column;
    }

    .cart-table-row {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1.2fr 1fr 40px;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--c-border-light);

      .product-cell {
        display: flex;
        align-items: center;
        gap: 1rem;

        .prod-thumb {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-sm);
          background-color: #F8F6F2;
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .prod-text {
          display: flex;
          flex-direction: column;

          .brand-tag {
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--c-gold-dark);
            text-transform: uppercase;
          }

          .prod-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.35rem;

            a {
              color: var(--c-dark);
              &:hover { color: var(--c-gold-hover); }
            }
          }

          .prod-options-pills {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.78rem;

            .color-pill {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              color: var(--c-muted);

              .dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
              }
            }

            .lens-pill {
              background-color: var(--c-surface);
              padding: 0.15rem 0.5rem;
              border-radius: 3px;
              color: var(--c-dark-secondary);
            }
          }
        }
      }

      .price-cell {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--c-dark);
      }

      .qty-cell {
        .qty-ctrl {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--c-border);
          border-radius: var(--radius-sm);
          overflow: hidden;

          .q-btn {
            width: 30px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FFFFFF;

            &:hover { background: var(--c-surface); }
          }

          .q-val {
            padding: 0 0.65rem;
            font-size: 0.9rem;
            font-weight: 700;
          }
        }
      }

      .total-cell {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--c-dark);
      }

      .act-cell {
        .del-btn {
          color: var(--c-muted-light);
          transition: color 0.2s;

          &:hover { color: var(--c-danger); }
        }
      }
    }

    .cart-footer-bar {
      padding: 1.25rem 1.5rem;
      background-color: var(--c-surface-soft);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .btn-clear-cart {
        color: var(--c-danger);
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
      }
    }

    /* Summary Sidebar */
    .summary-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 2rem;

      .summary-title {
        font-size: 1.3rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--c-border-light);
      }
    }

    .coupon-section {
      margin-bottom: 1.75rem;

      .coupon-form {
        display: flex;
        gap: 0.5rem;

        .coupon-input {
          flex: 1;
          padding: 0.65rem 0.85rem;
          border: 1px solid var(--c-border);
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          outline: none;

          &:focus { border-color: var(--c-gold); }
        }
      }

      .coupon-applied-alert {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--c-gold-light);
        border: 1px solid rgba(197, 168, 128, 0.4);
        padding: 0.45rem 0.85rem;
        border-radius: var(--radius-sm);
        font-size: 0.82rem;
        color: var(--c-gold-dark);
        margin-top: 0.75rem;

        .del-coupon {
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--c-muted);
          &:hover { color: var(--c-danger); }
        }
      }
    }

    .prices-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .p-line {
        display: flex;
        justify-content: space-between;
        font-size: 0.95rem;
        color: var(--c-muted);

        &.discount {
          color: var(--c-danger);
          font-weight: 700;
        }

        .free-badge {
          color: var(--c-success);
          font-weight: 700;
        }

        &.grand-total {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--c-dark);
          padding-top: 1rem;
          border-top: 2px solid var(--c-border);

          .total-val {
            color: var(--c-gold-dark);
          }
        }
      }
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: var(--c-muted);
      margin-top: 1.25rem;
      text-align: center;
      justify-content: center;
    }

    /* Checkout Modal */
    .checkout-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 18, 18, 0.75);
      backdrop-filter: blur(6px);
      z-index: 220;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .checkout-modal-panel {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2.5rem;
    }

    .modal-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--c-border);

      .m-title {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        h3 {
          font-size: 1.3rem;
          font-weight: 800;
        }
      }
    }

    .form-section-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--c-gold-dark);
      margin-bottom: 1rem;
    }

    .demo-mode-pill {
      display: inline-block;
      background-color: var(--c-gold-light);
      color: var(--c-gold-dark);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(197, 168, 128, 0.4);
      margin-top: 0.2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .payment-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;

      .pay-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s;

        input {
          accent-color: var(--c-gold);
        }

        &.selected {
          border-color: var(--c-gold);
          background-color: var(--c-gold-light);
          font-weight: 700;
        }
      }
    }

    .checkout-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1.5rem;
      border-top: 1px solid var(--c-border);

      .c-total {
        display: flex;
        flex-direction: column;

        span {
          font-size: 0.85rem;
          color: var(--c-muted);
        }

        strong {
          font-size: 1.4rem;
          color: var(--c-dark);
        }
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .w-100 {
      width: 100%;
    }

    .mt-3 {
      margin-top: 1.5rem;
    }

    @media (max-width: 900px) {
      .cart-layout-grid {
        grid-template-columns: 1fr;
      }
      .cart-table-header {
        display: none;
      }
      .cart-table-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .form-grid, .payment-options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private orderApiService = inject(OrderApiService);
  private route = inject(ActivatedRoute);

  couponCode = '';
  isCheckoutModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  orderSuccess = signal<boolean>(false);
  orderId = signal<string>('');
  orderPaidTotal = signal<number>(0);
  orderTrackingToken = signal<string>('');
  private checkoutIdempotencyKey: string | null = null;

  checkoutForm = {
    fullName: '',
    phone: '',
    email: '',
    city: 'القاهرة',
    address: '',
    paymentMethod: 'COD',
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['checkout'] === 'true' && this.cartService.items().length > 0) {
        this.openCheckoutModal();
      }
    });
  }

  changeQty(itemId: string, newQty: number): void {
    this.cartService.updateQuantity(itemId, newQty);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
    this.notificationService.info('تم حذف المنتج من الحقيبة');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.notificationService.info('تم إفراغ حقيبة التسوق');
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    const res = this.cartService.applyCoupon(this.couponCode);
    if (res.success) {
      this.notificationService.success(res.message);
      this.couponCode = '';
    } else {
      this.notificationService.error(res.message);
    }
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.notificationService.info('تمت إزالة كود الخصم');
  }

  openCheckoutModal(): void {
    if (!this.checkoutIdempotencyKey) {
      this.checkoutIdempotencyKey = 'idemp_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    }
    this.isCheckoutModalOpen.set(true);
  }

  closeCheckoutModal(): void {
    this.isCheckoutModalOpen.set(false);
  }

  submitOrder(event: Event): void {
    event.preventDefault();
    if (this.isSubmitting()) return;

    if (!this.checkoutForm.fullName || !this.checkoutForm.phone || !this.checkoutForm.email || !this.checkoutForm.address) {
      this.notificationService.warning('يرجى ملء جميع الحقول المطلوبة للتوصيل');
      return;
    }

    const items = this.cartService.items().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      selectedColor: item.selectedColor?.nameAr || undefined,
      lensOption: item.lensOption?.nameAr || undefined,
    }));

    if (items.length === 0) {
      this.notificationService.error('سلة المشتريات فارغة');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      customerName: this.checkoutForm.fullName,
      phone: this.checkoutForm.phone,
      email: this.checkoutForm.email,
      city: this.checkoutForm.city,
      address: this.checkoutForm.address,
      items,
      couponCode: this.cartService.appliedCoupon() || null,
      paymentMethod: 'COD' as const,
      notes: 'طلب متجر أوبتيكا لاكشري - دفع عند الاستلام (COD)',
      idempotencyKey: this.checkoutIdempotencyKey,
    };

    this.orderApiService.createOrder(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          const confirmedOrder = res.data;
          this.orderId.set(confirmedOrder.orderNumber);
          this.orderPaidTotal.set(confirmedOrder.total);

          if (res.trackingToken) {
            this.orderTrackingToken.set(res.trackingToken);
            try {
              localStorage.setItem(`optica_tracking_${confirmedOrder.orderNumber}`, res.trackingToken);
            } catch (_) {}
          }

          // Clear cart ONLY after backend confirmation as strictly required!
          this.cartService.clearCart();
          this.closeCheckoutModal();
          this.orderSuccess.set(true);

          this.notificationService.success(
            `تم تأكيد طلبك برقم ${confirmedOrder.orderNumber} بنجاح!`,
            'طلب مؤكد - الدفع عند الاستلام'
          );

          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errMsg = err.error?.message || 'تعذر إتمام الطلب، يرجى المحاولة مجدداً.';
        this.notificationService.error(errMsg, 'فشل إتمام الطلب');
        // Cart contents are intentionally kept intact!
      },
    });
  }

  getPaymentLabel(method: string): string {
    return 'الدفع عند الاستلام (Cash on Delivery)';
  }
}

