import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminDashboardService, DashboardMetrics, OrderTrendItem, RecentOrderItem, StatusDistributionItem } from '../../../core/services/admin-dashboard.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-page">
      <div class="page-top-row">
        <div>
          <h1 class="page-heading">لوحة المؤشرات والعمليات</h1>
          <p class="page-subheading">نظرة عامة على المبيعات، الطلبات، وحالة المخزون التجريبي</p>
        </div>

        <button (click)="loadData()" [disabled]="loading()" class="btn btn-outline btn-sm">
          <app-icon name="rotate-ccw" [size]="14"></app-icon>
          <span>تحديث البيانات</span>
        </button>
      </div>

      <!-- KPI Metrics Cards Grid -->
      <div class="metrics-grid">
        <!-- 1. Total Sales -->
        <div class="kpi-card sales-kpi">
          <div class="kpi-icon-wrap">
            <app-icon name="award" [size]="24"></app-icon>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">إجمالي المبيعات التجريبية</span>
            <div class="kpi-val">{{ metrics()?.totalDemoSales || 0 }} <span class="cur">ج.م</span></div>
            <span class="kpi-hint success">لا يشمل الطلبات الملغاة</span>
          </div>
        </div>

        <!-- 2. Total Orders -->
        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <app-icon name="cart" [size]="24"></app-icon>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">إجمالي عدد الطلبات</span>
            <div class="kpi-val">{{ metrics()?.totalOrders || 0 }}</div>
            <span class="kpi-hint">{{ metrics()?.completedOrders || 0 }} طلب مكتمل</span>
          </div>
        </div>

        <!-- 3. New Pending Orders -->
        <div class="kpi-card warning-kpi">
          <div class="kpi-icon-wrap">
            <app-icon name="clock" [size]="24"></app-icon>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">طلبات جديدة معلقة</span>
            <div class="kpi-val">{{ metrics()?.newOrders || 0 }}</div>
            <span class="kpi-hint warning">بانتظار المعالجة والتأكيد</span>
          </div>
        </div>

        <!-- 4. Total Products -->
        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <app-icon name="glasses" [size]="24"></app-icon>
          </div>
          <div class="kpi-content">
            <span class="kpi-title">إجمالي المنتجات بالمخزون</span>
            <div class="kpi-val">{{ metrics()?.totalProducts || 0 }}</div>
            <span class="kpi-hint">{{ metrics()?.lowStockProducts || 0 }} منتجات قاربت على النفاد</span>
          </div>
        </div>
      </div>

      <!-- Charts & Visual Overview Section -->
      <div class="charts-grid mt-4">
        <!-- Orders & Sales Over Time (Bar Chart) -->
        <div class="chart-card">
          <div class="card-head">
            <h3>حركة الطلبات والمبيعات (آخر 7 أيام)</h3>
            <span class="badge badge-gold">تحديث مباشر</span>
          </div>

          <div class="bar-chart-container">
            @for (bar of ordersTrend(); track bar.date) {
              <div class="bar-col">
                <div class="bar-val-hint">{{ bar.sales }} ج.م</div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.height.%]="getBarHeight(bar.sales)"
                    [title]="bar.sales + ' ج.م (' + bar.count + ' طلبات)'"
                  ></div>
                </div>
                <span class="bar-label">{{ formatDay(bar.date) }}</span>
                <span class="bar-sub">{{ bar.count }} طلب</span>
              </div>
            }
          </div>
        </div>

        <!-- Status Distribution Card -->
        <div class="chart-card">
          <div class="card-head">
            <h3>توزيع حالات الطلبات</h3>
            <span class="badge badge-category">النسب الحالية</span>
          </div>

          <div class="status-list-container">
            @for (stat of statusDistribution(); track stat.status) {
              <div class="status-row">
                <div class="status-meta">
                  <span class="status-dot" [style.background-color]="stat.color"></span>
                  <span class="status-name">{{ stat.label }} ({{ stat.status }})</span>
                </div>
                <div class="status-progress-wrap">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      [style.background-color]="stat.color"
                      [style.width.%]="getStatusPercent(stat.count)"
                    ></div>
                  </div>
                  <span class="status-count-val">{{ stat.count }} طلب</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Orders Table Section -->
      <div class="recent-orders-card mt-4">
        <div class="card-head">
          <div>
            <h3>أحدث الطلبات المستلمة</h3>
            <p class="head-sub">قائمة بآخر 5 طلبات تم تسجيلها في قاعدة البيانات</p>
          </div>
          <a routerLink="/admin/orders" class="btn btn-primary btn-sm">
            <span>عرض كافة الطلبات</span>
            <app-icon name="arrow-left" [size]="14"></app-icon>
          </a>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم العميل</th>
                <th>رقم الجوال</th>
                <th>التاريخ</th>
                <th>الإجمالي</th>
                <th>طريقة الدفع</th>
                <th>حالة الطلب</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @if (recentOrders().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-4">لا توجد طلبات مسجلة حتى الآن</td>
                </tr>
              } @else {
                @for (order of recentOrders(); track order.id) {
                  <tr>
                    <td>
                      <strong class="order-num font-brand">{{ order.orderNumber }}</strong>
                    </td>
                    <td>{{ order.customerName }}</td>
                    <td dir="ltr" class="text-right">{{ order.phone }}</td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                    <td>
                      <strong class="price-strong">{{ order.total }} ج.م</strong>
                    </td>
                    <td>
                      <span class="badge badge-category">{{ getPaymentLabel(order.paymentMethod) }}</span>
                    </td>
                    <td>
                      <span class="badge" [class]="'badge-status-' + order.orderStatus.toLowerCase()">
                        {{ getStatusLabel(order.orderStatus) }}
                      </span>
                    </td>
                    <td>
                      <a [routerLink]="['/admin/orders', order.id]" class="btn-action-view">
                        عرض التفاصيل
                      </a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
    }

    .page-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;

      .page-heading {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--c-dark);
        margin-bottom: 0.2rem;
      }

      .page-subheading {
        font-size: 0.92rem;
        color: var(--c-muted);
      }
    }

    /* KPI Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .kpi-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      box-shadow: var(--shadow-subtle);

      &.sales-kpi {
        border-color: var(--c-gold);
        background: linear-gradient(135deg, #FFFFFF 0%, #FDFBF7 100%);
        .kpi-icon-wrap {
          background-color: var(--c-gold-light);
          color: var(--c-gold-dark);
        }
      }

      &.warning-kpi {
        .kpi-icon-wrap {
          background-color: #FEF3C7;
          color: #D97706;
        }
      }

      .kpi-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-sm);
        background-color: var(--c-surface);
        color: var(--c-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .kpi-content {
        display: flex;
        flex-direction: column;

        .kpi-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--c-muted);
          margin-bottom: 0.35rem;
        }

        .kpi-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--c-dark);
          line-height: 1.2;

          .cur {
            font-size: 0.95rem;
            color: var(--c-gold-dark);
            font-weight: 700;
          }
        }

        .kpi-hint {
          font-size: 0.75rem;
          color: var(--c-muted);
          margin-top: 0.35rem;

          &.success {
            color: var(--c-success);
          }

          &.warning {
            color: #D97706;
            font-weight: 600;
          }
        }
      }
    }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 1.5rem;
    }

    .chart-card, .recent-orders-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 1.75rem;
      box-shadow: var(--shadow-subtle);
    }

    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--c-border-light);

      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--c-dark);
      }

      .head-sub {
        font-size: 0.82rem;
        color: var(--c-muted);
        margin-top: 0.15rem;
      }
    }

    /* Bar Chart */
    .bar-chart-container {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 220px;
      padding-top: 2rem;
      gap: 0.75rem;
    }

    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;

      .bar-val-hint {
        font-size: 0.68rem;
        color: var(--c-gold-dark);
        font-weight: 700;
        margin-bottom: 0.35rem;
      }

      .bar-track {
        flex: 1;
        width: 100%;
        max-width: 32px;
        background-color: var(--c-surface);
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        display: flex;
        align-items: flex-end;
        overflow: hidden;

        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, var(--c-gold) 0%, #AF8E60 100%);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          transition: height 0.6s ease;
          min-height: 4px;
        }
      }

      .bar-label {
        font-size: 0.75rem;
        font-weight: 700;
        margin-top: 0.5rem;
        color: var(--c-dark);
      }

      .bar-sub {
        font-size: 0.68rem;
        color: var(--c-muted);
      }
    }

    /* Status List */
    .status-list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      .status-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 130px;

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--c-dark);
        }
      }

      .status-progress-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .progress-bar {
          flex: 1;
          height: 8px;
          background-color: var(--c-surface);
          border-radius: var(--radius-full);
          overflow: hidden;

          .progress-fill {
            height: 100%;
            border-radius: var(--radius-full);
            transition: width 0.5s;
          }
        }

        .status-count-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--c-dark);
          min-width: 45px;
          text-align: left;
        }
      }
    }

    /* Table */
    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;

      th {
        padding: 0.85rem 1rem;
        background-color: var(--c-surface-soft);
        font-weight: 700;
        color: var(--c-muted);
        text-align: right;
        border-bottom: 1px solid var(--c-border);
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid var(--c-border-light);
        color: var(--c-dark);
      }
    }

    .order-num {
      color: var(--c-dark);
      font-size: 0.92rem;
    }

    .price-strong {
      color: var(--c-gold-dark);
    }

    .btn-action-view {
      color: var(--c-gold-dark);
      font-weight: 700;
      font-size: 0.82rem;
      padding: 0.3rem 0.6rem;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      display: inline-block;
      transition: all 0.2s;

      &:hover {
        background-color: var(--c-gold);
        color: #121212;
        border-color: var(--c-gold);
      }
    }

    /* Status Badges */
    .badge-status-pending { background-color: #FEF3C7; color: #D97706; }
    .badge-status-confirmed { background-color: #DBEAFE; color: #2563EB; }
    .badge-status-processing { background-color: #EDE9FE; color: #7C3AED; }
    .badge-status-shipped { background-color: #CFFAFE; color: #0891B2; }
    .badge-status-delivered { background-color: #D1FAE5; color: #059669; }
    .badge-status-cancelled { background-color: #FEE2E2; color: #DC2626; }

    .mt-4 { margin-top: 1.5rem; }

    @media (max-width: 1200px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(AdminDashboardService);

  metrics = signal<DashboardMetrics | null>(null);
  statusDistribution = signal<StatusDistributionItem[]>([]);
  ordersTrend = signal<OrderTrendItem[]>([]);
  recentOrders = signal<RecentOrderItem[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.dashboardService.getOverview().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.metrics.set(res.data.metrics);
          this.statusDistribution.set(res.data.statusDistribution);
          this.ordersTrend.set(res.data.ordersTrend);
          this.recentOrders.set(res.data.recentOrders);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getBarHeight(sales: number): number {
    const max = Math.max(...this.ordersTrend().map((b) => b.sales), 1000);
    return Math.max(8, Math.round((sales / max) * 100));
  }

  getStatusPercent(count: number): number {
    const total = this.metrics()?.totalOrders || 1;
    return Math.max(4, Math.round((count / total) * 100));
  }

  formatDay(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { weekday: 'short' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Confirmed: 'مؤكد',
      Processing: 'قيد التجهيز',
      Shipped: 'تم الشحن',
      Delivered: 'تم التسليم',
      Cancelled: 'ملغي',
    };
    return map[status] || status;
  }

  getPaymentLabel(method: string): string {
    const map: Record<string, string> = {
      demo_card: 'بطاقة بنكية',
      demo_wallet: 'محفظة ذكية',
      demo_fawry: 'فوري باي',
      demo_cod: 'عند الاستلام',
      applepay: 'Apple Pay',
      mada: 'مدى',
    };
    return map[method] || method;
  }
}
