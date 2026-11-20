import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminCouponsService, CouponDto } from '../../../core/services/admin-coupons.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="coupons-mgmt-page">
      <!-- Top Title & Action -->
      <div class="page-top-row">
        <div>
          <h1 class="page-heading">إدارة قسائم الخصم والعروض</h1>
          <p class="page-subheading">إنشاء أكواد التخفيض، تحديد نسب الخصم وتفعيل أو تعطيل الكوبونات</p>
        </div>

        <div class="top-actions">
          <button (click)="openAddModal()" class="btn btn-primary btn-sm">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>إنشاء كوبون جديد</span>
          </button>

          <button (click)="loadCoupons()" [disabled]="loading()" class="btn btn-outline btn-sm">
            <app-icon name="rotate-ccw" [size]="14"></app-icon>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      <!-- Action Toast Alert -->
      @if (actionMessage()) {
        <div class="action-alert" [class.success]="actionMessage()!.type === 'success'" [class.error]="actionMessage()!.type === 'error'">
          <app-icon [name]="actionMessage()!.type === 'success' ? 'check' : 'close'" [size]="16"></app-icon>
          <span>{{ actionMessage()!.text }}</span>
        </div>
      }

      <!-- Coupons Table Card -->
      <div class="table-card">
        @if (loading()) {
          <div class="state-container">
            <div class="loading-spinner"></div>
            <p>جارٍ تحميل قسائم الخصم...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="state-container error">
            <app-icon name="close" [size]="32"></app-icon>
            <p>{{ errorMessage() }}</p>
            <button (click)="loadCoupons()" class="btn btn-outline btn-sm mt-3">إعادة المحاولة</button>
          </div>
        } @else if (coupons().length === 0) {
          <div class="state-container empty">
            <app-icon name="sparkles" [size]="40"></app-icon>
            <h3>لا توجد قسائم خصم حالياً</h3>
            <p>قم بإنشاء أول كود تخفيض للعملاء في متجر أوبتيكا لاكشري</p>
            <button (click)="openAddModal()" class="btn btn-primary btn-sm mt-3">إنشاء كوبون</button>
          </div>
        } @else {
          <div class="table-meta">
            <span>إجمالي الكوبونات: <strong>{{ coupons().length }}</strong> كوبون</span>
          </div>

          <div class="table-wrapper">
            <table class="coupons-table">
              <thead>
                <tr>
                  <th>رمز الكوبون</th>
                  <th>نوع الخصم</th>
                  <th>قيمة الخصم</th>
                  <th>مرات الاستخدام</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                @for (coupon of coupons(); track coupon.id) {
                  <tr>
                    <!-- Code -->
                    <td>
                      <span class="coupon-code-badge font-mono">{{ coupon.code }}</span>
                    </td>

                    <!-- Type -->
                    <td>
                      <span class="type-tag">
                        {{ coupon.discountType === 'PERCENTAGE' ? 'نسبة مئوية (%)' : 'مبلغ ثابت (ج.م)' }}
                      </span>
                    </td>

                    <!-- Value -->
                    <td class="font-bold font-mono">
                      @if (coupon.discountType === 'PERCENTAGE') {
                        <span>{{ coupon.discountValue }}%</span>
                      } @else {
                        <span>{{ coupon.discountValue | number }} ج.م</span>
                      }
                    </td>

                    <!-- Usage -->
                    <td class="font-mono text-muted">
                      {{ coupon.usageCount || 0 }} استخدام
                    </td>

                    <!-- Expiry -->
                    <td class="text-sm text-muted">
                      {{ coupon.expiryDate ? (coupon.expiryDate | date: 'dd/MM/yyyy') : 'بدون انتهاء' }}
                    </td>

                    <!-- Active Toggle -->
                    <td>
                      <button
                        (click)="toggleActive(coupon)"
                        [disabled]="togglingId() === coupon.id"
                        class="status-toggle-btn"
                        [class.active]="coupon.isActive"
                      >
                        <span class="dot"></span>
                        <span>{{ coupon.isActive ? 'مفعل' : 'معطل' }}</span>
                      </button>
                    </td>

                    <!-- Actions -->
                    <td>
                      <div class="action-buttons">
                        <button
                          (click)="openEditModal(coupon)"
                          class="btn-icon"
                          title="تعديل الكوبون"
                        >
                          <app-icon name="sparkles" [size]="14"></app-icon>
                        </button>

                        <button
                          (click)="deleteCoupon(coupon)"
                          class="btn-icon danger"
                          title="حذف الكوبون"
                        >
                          <app-icon name="trash" [size]="14"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Add / Edit Coupon Modal -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ isEditing() ? 'تعديل كود الخصم' : 'إنشاء كود خصم جديد' }}</h3>
              <button (click)="closeModal()" class="btn-close-modal">
                <app-icon name="close" [size]="18"></app-icon>
              </button>
            </div>

            <form (ngSubmit)="saveCoupon()" class="modal-form">
              <div class="form-group">
                <label class="form-label">كود الخصم (Promo Code) *</label>
                <input
                  type="text"
                  [(ngModel)]="formCoupon.code"
                  name="code"
                  required
                  placeholder="مثال: LUXE2026 أو SUMMER20"
                  class="form-input font-mono uppercase"
                />
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">نوع الخصم *</label>
                  <select [(ngModel)]="formCoupon.discountType" name="discountType" required class="form-select">
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED">مبلغ نقدي ثابت (ج.م)</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">قيمة الخصم *</label>
                  <input
                    type="number"
                    [(ngModel)]="formCoupon.discountValue"
                    name="discountValue"
                    required
                    min="1"
                    class="form-input font-mono"
                    [placeholder]="formCoupon.discountType === 'PERCENTAGE' ? 'مثال: 15' : 'مثال: 200'"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">تاريخ انتهاء الصلاحية (اختياري)</label>
                <input
                  type="date"
                  [(ngModel)]="formCoupon.expiryDate"
                  name="expiryDate"
                  class="form-input font-mono"
                />
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formCoupon.isActive" name="isActive" />
                  <span>تفعيل الكوبون فور الحفظ</span>
                </label>
              </div>

              <div class="modal-footer">
                <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">إلغاء</button>
                <button type="submit" [disabled]="saving()" class="btn btn-primary btn-sm">
                  @if (saving()) {
                    <span>جارٍ الحفظ...</span>
                  } @else {
                    <span>{{ isEditing() ? 'تحديث الكوبون' : 'حفظ الكوبون' }}</span>
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
    .coupons-mgmt-page {
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

    .top-actions {
      display: flex;
      gap: 0.75rem;
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

    .coupons-table {
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
        padding: 0.95rem 1rem;
        border-bottom: 1px solid #f0ebe1;
        font-size: 0.9rem;
        vertical-align: middle;
      }

      tbody tr:hover {
        background: #faf8f5;
      }
    }

    .coupon-code-badge {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      background: #f5f1ea;
      border: 1px dashed #c5a059;
      color: #1a1a1a;
      border-radius: 4px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .type-tag {
      font-size: 0.8rem;
      color: #666;
      background: #faf8f5;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #eee;
    }

    .status-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      background: #f5f5f5;
      color: #777;
      transition: all 0.2s ease;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #bbb;
      }

      &.active {
        background: #eafaf1;
        color: #27ae60;
        border-color: #a9dfbf;

        .dot {
          background: #27ae60;
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.4rem;
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

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      border: 1px solid #e8e3d9;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e8e3d9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .btn-close-modal {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 0.35rem;

      &:hover {
        color: #111;
      }
    }

    .modal-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .flex-1 { flex: 1; }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #444;
    }

    .form-input, .form-select {
      width: 100%;
      height: 40px;
      padding: 0 0.75rem;
      border: 1px solid #d4cbb8;
      border-radius: 6px;
      background: #faf8f5;
      font-size: 0.9rem;
      color: #222;

      &:focus {
        outline: none;
        border-color: #c5a059;
        background: #fff;
      }
    }

    .uppercase {
      text-transform: uppercase;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #444;
      cursor: pointer;
      padding: 0.5rem 0;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e8e3d9;
    }

    /* Common */
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-muted { color: #888; }
    .text-sm { font-size: 0.82rem; }

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

    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      text-align: center;
      color: #666;
      &.empty h3 { margin: 1rem 0 0.5rem; color: #222; }
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
export class AdminCouponsComponent implements OnInit {
  private adminCouponsService = inject(AdminCouponsService);

  coupons = signal<CouponDto[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  togglingId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  actionMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  modalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentEditingId: string | null = null;

  formCoupon: CouponDto = this.getEmptyCoupon();

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminCouponsService.getAll().subscribe({
      next: (res) => {
        this.coupons.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'تعذر تحميل قسائم الخصم');
        this.loading.set(false);
      },
    });
  }

  toggleActive(coupon: CouponDto): void {
    if (!coupon.id) return;
    this.togglingId.set(coupon.id);

    this.adminCouponsService.toggleActive(coupon.id).subscribe({
      next: (res) => {
        this.togglingId.set(null);
        this.coupons.update((list) =>
          list.map((c) => (c.id === coupon.id ? res.data : c))
        );
        this.showToast(`تم ${res.data.isActive ? 'تفعيل' : 'تعطيل'} الكوبون بنجاح`, 'success');
      },
      error: (err) => {
        this.togglingId.set(null);
        this.showToast(err?.error?.message || 'تعذر تغيير حالة الكوبون', 'error');
      },
    });
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.currentEditingId = null;
    this.formCoupon = this.getEmptyCoupon();
    this.modalOpen.set(true);
  }

  openEditModal(coupon: CouponDto): void {
    this.isEditing.set(true);
    this.currentEditingId = coupon.id || null;
    this.formCoupon = {
      ...coupon,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.substring(0, 10) : null,
    };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  saveCoupon(): void {
    this.saving.set(true);
    this.formCoupon.code = this.formCoupon.code.trim().toUpperCase();

    if (this.isEditing() && this.currentEditingId) {
      this.adminCouponsService.update(this.currentEditingId, this.formCoupon).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.closeModal();
          this.coupons.update((list) =>
            list.map((c) => (c.id === this.currentEditingId ? res.data : c))
          );
          this.showToast('تم تحديث الكوبون بنجاح', 'success');
        },
        error: (err) => {
          this.saving.set(false);
          this.showToast(err?.error?.message || 'تعذر تحديث الكوبون', 'error');
        },
      });
    } else {
      this.adminCouponsService.create(this.formCoupon).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.closeModal();
          this.coupons.update((list) => [res.data, ...list]);
          this.showToast('تم إنشاء الكوبون الجديد بنجاح', 'success');
        },
        error: (err) => {
          this.saving.set(false);
          this.showToast(err?.error?.message || 'تعذر إنشاء الكوبون', 'error');
        },
      });
    }
  }

  deleteCoupon(coupon: CouponDto): void {
    if (!coupon.id) return;
    if (!confirm(`هل أنت متأكد من حذف كود الخصم "${coupon.code}"؟`)) return;

    this.adminCouponsService.delete(coupon.id).subscribe({
      next: () => {
        this.coupons.update((list) => list.filter((c) => c.id !== coupon.id));
        this.showToast('تم حذف الكوبون بنجاح', 'success');
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'تعذر حذف الكوبون', 'error');
      },
    });
  }

  private getEmptyCoupon(): CouponDto {
    return {
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      isActive: true,
      expiryDate: null,
    };
  }

  private showToast(text: string, type: 'success' | 'error'): void {
    this.actionMessage.set({ text, type });
    setTimeout(() => {
      this.actionMessage.set(null);
    }, 4000);
  }
}
