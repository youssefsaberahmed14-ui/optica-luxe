import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderApiService, OrderData } from '../../../core/services/order-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="orders-page">
      <!-- Top Title & Action -->
      <div class="page-top-row">
        <div>
          <h1 class="page-heading">إدارة طلبات العملاء</h1>
          <p class="page-subheading">متابعة حالات الطلبات التجريبية وتحديث الشحن والتحصيل في الوقت الفعلي</p>
        </div>

        <button (click)="loadOrders()" [disabled]="loading()" class="btn btn-outline btn-sm">
          <app-icon name="rotate-ccw" [size]="14"></app-icon>
          <span>تحديث الطلبات</span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-card">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="بحث برقم الطلب (OPT-...)، اسم العميل، أو رقم الهاتف..."
            class="input-search"
          />
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">حالة الطلب:</label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="all">كل الحالات</option>
              <option value="Pending">معلق (Pending)</option>
              <option value="Confirmed">مؤكد (Confirmed)</option>
              <option value="Processing">قيد التجهيز (Processing)</option>
              <option value="Shipped">تم الشحن (Shipped)</option>
              <option value="Delivered">تم التوصيل (Delivered)</option>
              <option value="Cancelled">ملغي (Cancelled)</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">حالة الدفع:</label>
            <select [(ngModel)]="selectedPayment" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="all">كل حالات الدفع</option>
              <option value="Demo Paid">مدفوع تجريبي (Demo Paid)</option>
              <option value="Unpaid">غير مدفوع (Unpaid)</option>
              <option value="Refunded">مسترجع (Refunded)</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">الترتيب:</label>
            <select [(ngModel)]="selectedSort" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="total_desc">الأعلى قيمة</option>
              <option value="total_asc">الأقل قيمة</option>
            </select>
          </div>

          @if (searchQuery || selectedStatus !== 'all' || selectedPayment !== 'all') {
            <button (click)="resetFilters()" class="btn-text-clear">
              <app-icon name="close" [size]="14"></app-icon>
              <span>إعادة ضبط</span>
            </button>
          }
        </div>
      </div>

      <!-- Notification Toast -->
      @if (actionMessage()) {
        <div class="action-alert" [class.success]="actionMessage()!.type === 'success'" [class.error]="actionMessage()!.type === 'error'">
          <app-icon [name]="actionMessage()!.type === 'success' ? 'check' : 'close'" [size]="16"></app-icon>
          <span>{{ actionMessage()!.text }}</span>
        </div>
      }

      <!-- Orders Table Card -->
      <div class="table-card">
        @if (loading()) {
          <div class="state-container">
            <div class="loading-spinner"></div>
            <p>جارٍ تحميل بيانات الطلبات...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="state-container error">
            <app-icon name="close" [size]="32"></app-icon>
            <p>{{ errorMessage() }}</p>
            <button (click)="loadOrders()" class="btn btn-outline btn-sm mt-3">إعادة المحاولة</button>
          </div>
        } @else if (orders().length === 0) {
          <div class="state-container empty">
            <app-icon name="cart" [size]="40"></app-icon>
            <h3>لا توجد طلبات تطابق معايير البحث</h3>
            <p>جرب تغيير خيارات التصفية أو البحث برقم طلب مختلف</p>
            @if (searchQuery || selectedStatus !== 'all' || selectedPayment !== 'all') {
              <button (click)="resetFilters()" class="btn btn-primary btn-sm mt-3">إلغاء التصفية</button>
            }
          </div>
        } @else {
          <div class="table-meta">
            <span>عدد النتائج: <strong>{{ orders().length }}</strong> طلب</span>
          </div>

          <div class="table-wrapper">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>الهاتف</th>
                  <th>التاريخ</th>
                  <th>المجموع</th>
                  <th>طريقة الدفع</th>
                  <th>حالة الطلب</th>
                  <th>تعديل سريع</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <!-- Order Number -->
                    <td class="font-mono">
                      <a [routerLink]="['/admin/orders', order.id]" class="order-link">
                        {{ order.orderNumber }}
                      </a>
                    </td>

                    <!-- Customer Name -->
                    <td>
                      <div class="customer-info">
                        <span class="cust-name">{{ order.customerName }}</span>
                        <span class="cust-city">{{ order.city }}</span>
                      </div>
                    </td>

                    <!-- Phone -->
                    <td class="font-mono text-muted" dir="ltr" style="text-align: right;">
                      {{ order.phone }}
                    </td>

                    <!-- Date -->
                    <td class="text-muted text-sm">
                      {{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </td>

                    <!-- Total -->
                    <td class="font-bold">
                      {{ order.total | number }} <span class="cur">ج.م</span>
                    </td>

                    <!-- Payment -->
                    <td>
                      <div class="payment-badges">
                        <span class="pay-method">{{ formatPaymentMethod(order.paymentMethod) }}</span>
                        <span class="badge" [ngClass]="getPaymentStatusClass(order.paymentStatus)">
                          {{ formatPaymentStatus(order.paymentStatus) }}
                        </span>
                      </div>
                    </td>

                    <!-- Status Badge -->
                    <td>
                      <span class="badge" [ngClass]="getStatusClass(order.orderStatus)">
                        {{ formatOrderStatus(order.orderStatus) }}
                      </span>
                    </td>

                    <!-- Quick Status Change Select -->
                    <td>
                      <select
                        [value]="normalizeStatus(order.orderStatus)"
                        (change)="onQuickStatusChange(order, $event)"
                        [disabled]="updatingOrderId() === order.id"
                        class="status-quick-select"
                      >
                        <option value="Pending">معلق</option>
                        <option value="Confirmed">مؤكد</option>
                        <option value="Processing">قيد التجهيز</option>
                        <option value="Shipped">تم الشحن</option>
                        <option value="Delivered">تم التوصيل</option>
                        <option value="Cancelled">إلغاء الطلب</option>
                      </select>
                    </td>

                    <!-- Actions -->
                    <td>
                      <div class="action-buttons">
                        <a
                          [routerLink]="['/admin/orders', order.id]"
                          class="btn-icon"
                          title="عرض التفاصيل الكاملة"
                        >
                          <app-icon name="eye" [size]="16"></app-icon>
                        </a>

                        @if (normalizeStatus(order.orderStatus) !== 'Cancelled') {
                          <button
                            (click)="cancelOrder(order)"
                            [disabled]="updatingOrderId() === order.id"
                            class="btn-icon danger"
                            title="إلغاء الطلب"
                          >
                            <app-icon name="close" [size]="16"></app-icon>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-heading {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    .page-subheading {
      font-size: 0.9rem;
      color: #666;
      margin: 0.25rem 0 0 0;
    }

    /* Toolbar Card */
    .toolbar-card {
      background: #ffffff;
      border: 1px solid #e8e3d9;
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      color: #888;
      pointer-events: none;
    }

    .input-search {
      width: 100%;
      height: 44px;
      padding: 0 2.8rem 0 1rem;
      border: 1px solid #d4cbb8;
      border-radius: 6px;
      font-size: 0.95rem;
      background: #faf8f5;
      color: #222;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #c5a059;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.15);
      }
    }

    .filters-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.85rem;
      color: #555;
      font-weight: 600;
      white-space: nowrap;
    }

    .filter-select {
      height: 38px;
      padding: 0 0.75rem;
      border: 1px solid #d4cbb8;
      border-radius: 6px;
      background: #fff;
      font-size: 0.85rem;
      color: #222;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #c5a059;
      }
    }

    .btn-text-clear {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      color: #c0392b;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem;

      &:hover {
        text-decoration: underline;
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

    /* Table Card */
    .table-card {
      background: #ffffff;
      border: 1px solid #e8e3d9;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-meta {
      padding: 0.85rem 1.25rem;
      background: #faf8f5;
      border-bottom: 1px solid #e8e3d9;
      font-size: 0.85rem;
      color: #666;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;

      th {
        background: #f5f1ea;
        padding: 0.85rem 1rem;
        font-size: 0.82rem;
        font-weight: 700;
        color: #444;
        border-bottom: 1px solid #e8e3d9;
        white-space: nowrap;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #f0ebe1;
        font-size: 0.9rem;
        vertical-align: middle;
      }

      tbody tr:hover {
        background: #faf8f5;
      }
    }

    .font-mono {
      font-family: monospace;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .order-link {
      color: #c5a059;
      text-decoration: none;
      font-weight: 700;

      &:hover {
        text-decoration: underline;
      }
    }

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .cust-name {
      font-weight: 600;
      color: #1a1a1a;
    }

    .cust-city {
      font-size: 0.75rem;
      color: #888;
    }

    .text-muted {
      color: #777;
    }

    .text-sm {
      font-size: 0.8rem;
    }

    .font-bold {
      font-weight: 700;
      color: #111;
    }

    .cur {
      font-size: 0.75rem;
      font-weight: 500;
      color: #888;
    }

    .payment-badges {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      align-items: flex-start;
    }

    .pay-method {
      font-size: 0.75rem;
      color: #555;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;

      &.badge-pending {
        background: #fef5e7;
        color: #d68910;
        border: 1px solid #f8c471;
      }

      &.badge-confirmed {
        background: #ebf5fb;
        color: #2980b9;
        border: 1px solid #aed6f1;
      }

      &.badge-processing {
        background: #f4ecf7;
        color: #8e44ad;
        border: 1px solid #d2b4de;
      }

      &.badge-shipped {
        background: #e8f8f5;
        color: #16a085;
        border: 1px solid #a3e4d7;
      }

      &.badge-delivered {
        background: #eafaf1;
        color: #27ae60;
        border: 1px solid #a9dfbf;
      }

      &.badge-cancelled {
        background: #fdedec;
        color: #c0392b;
        border: 1px solid #f5b7b1;
      }

      &.badge-paid {
        background: #eafaf1;
        color: #27ae60;
      }

      &.badge-unpaid {
        background: #fef5e7;
        color: #d68910;
      }

      &.badge-refunded {
        background: #f2f4f4;
        color: #7f8c8d;
      }
    }

    .status-quick-select {
      height: 32px;
      padding: 0 0.5rem;
      font-size: 0.8rem;
      border: 1px solid #d4cbb8;
      border-radius: 4px;
      background: #faf8f5;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #c5a059;
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      border: 1px solid #d4cbb8;
      background: #fff;
      color: #444;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        background: #faf8f5;
        border-color: #c5a059;
        color: #c5a059;
      }

      &.danger:hover {
        background: #fdedec;
        border-color: #e74c3c;
        color: #e74c3c;
      }
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.85rem;
    }

    .btn-outline {
      background: #fff;
      border: 1px solid #c5a059;
      color: #c5a059;

      &:hover {
        background: #c5a059;
        color: #fff;
      }
    }

    .btn-primary {
      background: #111;
      color: #fff;

      &:hover {
        background: #c5a059;
      }
    }

    /* States */
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      text-align: center;
      color: #666;

      &.empty h3 {
        margin: 1rem 0 0.5rem 0;
        color: #222;
      }

      &.error {
        color: #c0392b;
      }
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

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `],
})
export class AdminOrdersComponent implements OnInit {
  private orderApiService = inject(OrderApiService);

  orders = signal<OrderData[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  updatingOrderId = signal<string | null>(null);
  actionMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  searchQuery = '';
  selectedStatus = 'all';
  selectedPayment = 'all';
  selectedSort = 'newest';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.orderApiService
      .getAllOrders({
        search: this.searchQuery.trim() || undefined,
        orderStatus: this.selectedStatus,
        paymentStatus: this.selectedPayment,
        sortBy: this.selectedSort,
      })
      .subscribe({
        next: (res) => {
          this.orders.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'فشل في تحميل الطلبات من الخادم');
          this.loading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.selectedPayment = 'all';
    this.selectedSort = 'newest';
    this.loadOrders();
  }

  onQuickStatusChange(order: OrderData, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    if (newStatus === order.orderStatus) return;

    this.updatingOrderId.set(order.id);
    this.orderApiService
      .updateOrderStatus(order.id, { orderStatus: newStatus })
      .subscribe({
        next: (res) => {
          this.updatingOrderId.set(null);
          this.orders.update((list) =>
            list.map((o) => (o.id === order.id ? res.data : o))
          );
          this.showToast(`تم تحديث حالة الطلب ${order.orderNumber} بنجاح إلى "${this.formatOrderStatus(newStatus)}"`, 'success');
        },
        error: (err) => {
          this.updatingOrderId.set(null);
          this.showToast(err?.error?.message || 'تعذر تحديث حالة الطلب', 'error');
          // Revert select back to current order status
          target.value = order.orderStatus;
        },
      });
  }

  cancelOrder(order: OrderData): void {
    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء الطلب رقم ${order.orderNumber}؟`)) return;

    this.updatingOrderId.set(order.id);
    this.orderApiService
      .updateOrderStatus(order.id, {
        orderStatus: 'Cancelled',
        notes: 'تم إلغاء الطلب بواسطة لوحة تحكم الإدارة التجريبية',
      })
      .subscribe({
        next: (res) => {
          this.updatingOrderId.set(null);
          this.orders.update((list) =>
            list.map((o) => (o.id === order.id ? res.data : o))
          );
          this.showToast(`تم إلغاء الطلب ${order.orderNumber} بنجاح`, 'success');
        },
        error: (err) => {
          this.updatingOrderId.set(null);
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
    const s = (status || '').toLowerCase();
    if (s.includes('paid')) return 'مدفوع تجريبياً';
    if (s.includes('unpaid')) return 'غير مدفوع';
    if (s.includes('refund')) return 'مسترجع';
    return status;
  }

  formatPaymentMethod(method: string): string {
    const map: Record<string, string> = {
      cash_on_delivery: 'دفع عند الاستلام',
      demo_card: 'بطاقة تجريبية',
      demo_instapay: 'انستاباي تجريبي',
      demo_vodafone: 'فودافون كاش تجريبي',
    };
    return map[method] || method;
  }
}
