import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderApiService, OrderData } from '../../../core/services/order-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order-detail-page">
      <!-- Top Navigation & Action -->
      <div class="top-nav-bar">
        <a routerLink="/admin/orders" class="back-link">
          <app-icon name="arrow-right" [size]="16"></app-icon>
          <span>العودة إلى قائمة الطلبات</span>
        </a>

        <div class="header-actions">
          <button (click)="loadOrder()" [disabled]="loading()" class="btn btn-outline btn-sm">
            <app-icon name="rotate-ccw" [size]="14"></app-icon>
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      <!-- Notification Toast -->
      @if (actionMessage()) {
        <div class="action-alert" [class.success]="actionMessage()!.type === 'success'" [class.error]="actionMessage()!.type === 'error'">
          <app-icon [name]="actionMessage()!.type === 'success' ? 'check' : 'close'" [size]="16"></app-icon>
          <span>{{ actionMessage()!.text }}</span>
        </div>
      }

      @if (loading()) {
        <div class="state-container">
          <div class="loading-spinner"></div>
          <p>جارٍ تحميل تفاصيل الطلب...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="state-container error">
          <app-icon name="close" [size]="32"></app-icon>
          <p>{{ errorMessage() }}</p>
          <a routerLink="/admin/orders" class="btn btn-primary btn-sm mt-3">العودة للطلبات</a>
        </div>
      } @else if (order()) {
        <!-- Order Header Banner -->
        <div class="order-header-card">
          <div class="order-title-info">
            <div class="order-number-row">
              <span class="order-num font-mono">{{ order()!.orderNumber }}</span>
              <span class="badge" [ngClass]="getStatusClass(order()!.orderStatus)">
                {{ formatOrderStatus(order()!.orderStatus) }}
              </span>
              <span class="badge" [ngClass]="getPaymentStatusClass(order()!.paymentStatus)">
                {{ formatPaymentStatus(order()!.paymentStatus) }}
              </span>
            </div>
            <div class="order-date-row">
              <app-icon name="clock" [size]="14"></app-icon>
              <span>تم إنشاء الطلب بتاريخ: {{ order()!.createdAt | date: 'dd/MM/yyyy - hh:mm a' }}</span>
              <span class="sep">•</span>
              <span class="demo-tag">طلب تجريبي في بيئة العرض</span>
            </div>
          </div>
        </div>

        <!-- 2-Column Content Layout -->
        <div class="detail-grid">
          <!-- Column 1: Items & Financials -->
          <div class="col-main">
            <!-- Items Table Card -->
            <div class="section-card">
              <h2 class="section-title">
                <app-icon name="glasses" [size]="18"></app-icon>
                <span>المنتجات المطلوبة ({{ order()!.items.length }})</span>
              </h2>

              <div class="items-list">
                @for (item of order()!.items; track item.id) {
                  <div class="order-item-row">
                    <img [src]="item.productImage" [alt]="item.productName" class="item-img" />
                    <div class="item-details">
                      <span class="item-name">{{ item.productName }}</span>
                      <div class="item-meta">
                        @if (item.selectedColor) {
                          <span class="meta-tag">اللون: {{ item.selectedColor }}</span>
                        }
                        @if (item.lensOption) {
                          <span class="meta-tag">العدسات: {{ item.lensOption }}</span>
                        }
                      </div>
                      <div class="item-calc font-mono">
                        <span>{{ item.unitPrice | number }} ج.م</span>
                        <span>×</span>
                        <span>{{ item.quantity }}</span>
                      </div>
                    </div>
                    <div class="item-total">
                      <span class="total-val">{{ item.total | number }}</span>
                      <span class="cur">ج.م</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Financial Summary Card -->
            <div class="section-card">
              <h2 class="section-title">
                <app-icon name="award" [size]="18"></app-icon>
                <span>ملخص الحساب والفاتورة</span>
              </h2>

              <div class="summary-breakdown">
                <div class="summary-row">
                  <span class="label">المجموع الفرعي:</span>
                  <span class="val font-mono">{{ order()!.subtotal | number }} ج.م</span>
                </div>

                @if (order()!.discount > 0) {
                  <div class="summary-row discount">
                    <span class="label">الخصم المطبق ({{ order()!.couponCode || 'كوبون' }}):</span>
                    <span class="val font-mono">-{{ order()!.discount | number }} ج.م</span>
                  </div>
                }

                <div class="summary-row">
                  <span class="label">تكلفة الشحن والتوصيل:</span>
                  <span class="val font-mono">
                    {{ order()!.shipping === 0 ? 'مجاني' : (order()!.shipping | number) + ' ج.م' }}
                  </span>
                </div>

                <div class="summary-row total-row">
                  <span class="label">المجموع الإجمالي النهائي:</span>
                  <span class="val font-bold font-mono">{{ order()!.total | number }} <span class="cur">ج.م</span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2: Customer, Shipping & Status Operations -->
          <div class="col-side">
            <!-- Customer Information Card -->
            <div class="section-card">
              <h2 class="section-title">
                <app-icon name="user" [size]="18"></app-icon>
                <span>بيانات العميل والشحن</span>
              </h2>

              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">اسم العميل:</span>
                  <span class="info-val font-bold">{{ order()!.customerName }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">رقم الهاتف:</span>
                  <span class="info-val font-mono" dir="ltr">{{ order()!.phone }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">البريد الإلكتروني:</span>
                  <span class="info-val font-mono" dir="ltr">{{ order()!.email }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">المدينة:</span>
                  <span class="info-val">{{ order()!.city }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">العنوان بالتفصيل:</span>
                  <span class="info-val">{{ order()!.address }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">طريقة الدفع:</span>
                  <span class="info-val">{{ formatPaymentMethod(order()!.paymentMethod) }}</span>
                </div>

                @if (order()!.notes) {
                  <div class="info-item full">
                    <span class="info-label">ملاحظات العميل:</span>
                    <p class="notes-box">{{ order()!.notes }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Status Control Card -->
            <div class="section-card status-manager">
              <h2 class="section-title">
                <app-icon name="shield-check" [size]="18"></app-icon>
                <span>إدارة حالة الطلب والتحصيل</span>
              </h2>

              <div class="form-group">
                <label class="form-label">حالة الطلب الحالية:</label>
                <select [(ngModel)]="editOrderStatus" class="form-select">
                  <option value="Pending">معلق (Pending)</option>
                  <option value="Confirmed">مؤكد (Confirmed)</option>
                  <option value="Processing">قيد التجهيز (Processing)</option>
                  <option value="Shipped">تم الشحن (Shipped)</option>
                  <option value="Delivered">تم التوصيل (Delivered)</option>
                  <option value="Cancelled">ملغي (Cancelled)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">حالة التحصيل (COD):</label>
                <select [(ngModel)]="editPaymentStatus" class="form-select">
                  <option value="UNPAID">غير مدفوع (UNPAID - بانتظار التسليم)</option>
                  <option value="PAID">تم التحصيل نقداً (PAID - تم التسليم)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">ملاحظات داخلية / حالة التتبع:</label>
                <textarea
                  [(ngModel)]="editNotes"
                  rows="3"
                  placeholder="أضف ملاحظة للمسؤول أو رقم بوليصة الشحن التجريبية..."
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="action-buttons-row">
                <button
                  (click)="saveStatusUpdate()"
                  [disabled]="updating()"
                  class="btn btn-primary btn-block"
                >
                  @if (updating()) {
                    <span>جارٍ الحفظ...</span>
                  } @else {
                    <app-icon name="check" [size]="16"></app-icon>
                    <span>حفظ التعديلات في قاعدة البيانات</span>
                  }
                </button>

                @if (order()!.orderStatus !== 'CANCELLED') {
                  <button
                    (click)="quickCancel()"
                    [disabled]="updating()"
                    class="btn btn-danger-outline btn-block mt-2"
                  >
                    <span>إلغاء هذا الطلب</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .order-detail-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .top-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s ease;

      &:hover {
        color: #c5a059;
      }
    }

    /* Action Alert */
    .action-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;

      &.success {
        background: #eafaf1;
        color: #27ae60;
        border: 1px solid #a9dfbf;
      }

      &.error {
        background: #fdedec;
        color: #c0392b;
        border: 1px solid #f5b7b1;
      }
    }

    /* Header Card */
    .order-header-card {
      background: #ffffff;
      border: 1px solid #e8e3d9;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .order-number-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .order-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .order-date-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #777;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .sep {
      color: #ccc;
    }

    .demo-tag {
      background: #fef5e7;
      color: #d68910;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Grid Layout */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;

      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }

    .col-main, .col-side {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Section Card */
    .section-card {
      background: #ffffff;
      border: 1px solid #e8e3d9;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f0ebe1;
    }

    /* Items List */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f5f1ea;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .item-img {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e8e3d9;
      background: #faf8f5;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 0.95rem;
    }

    .item-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .meta-tag {
      font-size: 0.75rem;
      background: #f5f1ea;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      color: #666;
    }

    .item-calc {
      font-size: 0.82rem;
      color: #888;
      display: flex;
      gap: 0.35rem;
    }

    .item-total {
      text-align: left;
      font-weight: 700;
      color: #111;
      font-size: 1rem;
      white-space: nowrap;
    }

    /* Financial Summary */
    .summary-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #555;

      &.discount {
        color: #27ae60;
      }

      &.total-row {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px dashed #d4cbb8;
        font-size: 1.15rem;
        color: #111;
      }
    }

    /* Customer Info List */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      font-size: 0.9rem;

      &.full {
        flex-direction: column;
        gap: 0.35rem;
      }
    }

    .info-label {
      color: #777;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .info-val {
      color: #222;
      text-align: left;
    }

    .notes-box {
      background: #faf8f5;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid #e8e3d9;
      color: #444;
      font-size: 0.85rem;
      margin: 0;
      width: 100%;
    }

    /* Status Form */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #444;
    }

    .form-select, .form-textarea {
      width: 100%;
      border: 1px solid #d4cbb8;
      border-radius: 6px;
      background: #faf8f5;
      font-size: 0.9rem;
      color: #222;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #c5a059;
        background: #fff;
      }
    }

    .form-select {
      height: 40px;
      padding: 0 0.75rem;
    }

    .form-textarea {
      padding: 0.6rem 0.75rem;
      resize: vertical;
    }

    .btn-block {
      width: 100%;
      justify-content: center;
    }

    .btn-danger-outline {
      background: #fff;
      border: 1px solid #e74c3c;
      color: #c0392b;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: #fdedec;
      }
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;

      &.badge-pending { background: #fef5e7; color: #d68910; border: 1px solid #f8c471; }
      &.badge-confirmed { background: #ebf5fb; color: #2980b9; border: 1px solid #aed6f1; }
      &.badge-processing { background: #f4ecf7; color: #8e44ad; border: 1px solid #d2b4de; }
      &.badge-shipped { background: #e8f8f5; color: #16a085; border: 1px solid #a3e4d7; }
      &.badge-delivered { background: #eafaf1; color: #27ae60; border: 1px solid #a9dfbf; }
      &.badge-cancelled { background: #fdedec; color: #c0392b; border: 1px solid #f5b7b1; }
      &.badge-paid { background: #eafaf1; color: #27ae60; }
      &.badge-unpaid { background: #fef5e7; color: #d68910; }
      &.badge-refunded { background: #f2f4f4; color: #7f8c8d; }
    }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .cur { font-size: 0.8rem; color: #888; font-weight: normal; }

    /* Button base */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-sm { padding: 0.4rem 0.85rem; font-size: 0.85rem; }
    .btn-outline { background: #fff; border: 1px solid #c5a059; color: #c5a059; &:hover { background: #c5a059; color: #fff; } }
    .btn-primary { background: #111; color: #fff; &:hover { background: #c5a059; } }

    /* State loading */
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 1rem;
      color: #666;
      &.error { color: #c0392b; }
    }

    .loading-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e8e3d9;
      border-top-color: #c5a059;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderApiService = inject(OrderApiService);

  order = signal<OrderData | null>(null);
  loading = signal<boolean>(true);
  updating = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  actionMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  editOrderStatus = '';
  editPaymentStatus = '';
  editNotes = '';

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('رقم الطلب غير صحيح');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.orderApiService.getOrderById(id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.editOrderStatus = this.normalizeStatus(res.data.orderStatus);
        this.editPaymentStatus = this.normalizePaymentStatus(res.data.paymentStatus);
        this.editNotes = res.data.notes || '';
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'تعذر تحميل بيانات الطلب');
        this.loading.set(false);
      },
    });
  }

  saveStatusUpdate(): void {
    const orderData = this.order();
    if (!orderData) return;

    this.updating.set(true);
    this.orderApiService
      .updateOrderStatus(orderData.id, {
        orderStatus: this.editOrderStatus,
        paymentStatus: this.editPaymentStatus,
        notes: this.editNotes,
      })
      .subscribe({
        next: (res) => {
          this.order.set(res.data);
          this.editOrderStatus = this.normalizeStatus(res.data.orderStatus);
          this.editPaymentStatus = this.normalizePaymentStatus(res.data.paymentStatus);
          this.updating.set(false);
          this.showToast('تم تحديث حالة الطلب في قاعدة البيانات بنجاح', 'success');
        },
        error: (err) => {
          this.updating.set(false);
          this.showToast(err?.error?.message || 'حدث خطأ أثناء حفظ التحديث', 'error');
        },
      });
  }

  quickCancel(): void {
    const orderData = this.order();
    if (!orderData) return;

    if (!confirm(`هل أنت متأكد من إلغاء الطلب ${orderData.orderNumber}؟`)) return;

    this.updating.set(true);
    this.orderApiService
      .updateOrderStatus(orderData.id, {
        orderStatus: 'Cancelled',
        notes: this.editNotes || 'تم إلغاء الطلب عبر شاشة إدارة التفاصيل',
      })
      .subscribe({
        next: (res) => {
          this.order.set(res.data);
          this.editOrderStatus = 'Cancelled';
          this.updating.set(false);
          this.showToast('تم إلغاء الطلب بنجاح', 'success');
        },
        error: (err) => {
          this.updating.set(false);
          this.showToast(err?.error?.message || 'تعذر إلغاء الطلب', 'error');
        },
      });
  }

  private showToast(text: string, type: 'success' | 'error'): void {
    this.actionMessage.set({ text, type });
    setTimeout(() => {
      this.actionMessage.set(null);
    }, 4000);
  }

  normalizeStatus(status: string | undefined): string {
    if (!status) return 'Pending';
    const s = status.trim().toLowerCase();
    if (s === 'pending') return 'Pending';
    if (s === 'confirmed') return 'Confirmed';
    if (s === 'processing') return 'Processing';
    if (s === 'shipped') return 'Shipped';
    if (s === 'delivered') return 'Delivered';
    if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
    return status;
  }

  normalizePaymentStatus(status: string | undefined): string {
    if (!status) return 'Demo Paid';
    const s = status.trim().toLowerCase();
    if (s.includes('paid')) return 'Demo Paid';
    if (s.includes('unpaid')) return 'Unpaid';
    if (s.includes('refund')) return 'Refunded';
    return status;
  }

  getStatusClass(status: string): string {
    switch (this.normalizeStatus(status)) {
      case 'Pending': return 'badge-pending';
      case 'Confirmed': return 'badge-confirmed';
      case 'Processing': return 'badge-processing';
      case 'Shipped': return 'badge-shipped';
      case 'Delivered': return 'badge-delivered';
      case 'Cancelled': return 'badge-cancelled';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('paid')) return 'badge-paid';
    if (s.includes('unpaid')) return 'badge-unpaid';
    if (s.includes('refund')) return 'badge-refunded';
    return '';
  }

  formatOrderStatus(status: string): string {
    const map: Record<string, string> = {
      Pending: 'معلق',
      Confirmed: 'مؤكد',
      Processing: 'قيد التجهيز',
      Shipped: 'تم الشحن',
      Delivered: 'تم التوصيل',
      Cancelled: 'ملغي',
    };
    return map[this.normalizeStatus(status)] || status;
  }

  formatPaymentStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') return 'تم التحصيل نقداً (مدفوع)';
    if (s === 'UNPAID') return 'غير مدفوع (بانتظار التحصيل عند التسليم)';
    return status;
  }

  formatPaymentMethod(method: string): string {
    return 'الدفع عند الاستلام (Cash on Delivery)';
  }
}
