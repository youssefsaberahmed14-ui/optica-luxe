import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminProductsService, ProductDto } from '../../../core/services/admin-products.service';
import { ProductService } from '../../../core/services/product.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="products-mgmt-page">
      <!-- Top Title & Action -->
      <div class="page-top-row">
        <div>
          <h1 class="page-heading">إدارة المنتجات والمخزون</h1>
          <p class="page-subheading">إضافة وتعديل تشكيلة النظارات الفاخرة وضبط الأسعار والمخزون الحي</p>
        </div>

        <div class="top-actions">
          <button (click)="openAddModal()" class="btn btn-primary btn-sm">
            <app-icon name="plus" [size]="14"></app-icon>
            <span>إضافة منتج جديد</span>
          </button>

          <button (click)="loadProducts()" [disabled]="loading()" class="btn btn-outline btn-sm">
            <app-icon name="rotate-ccw" [size]="14"></app-icon>
            <span>تحديث</span>
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

      <!-- Search & Filters Toolbar -->
      <div class="toolbar-card">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="بحث باسم المنتج، الماركة، أو رمز SKU..."
            class="input-search"
          />
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">التصنيف:</label>
            <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="all">كل الفئات</option>
              <option value="sunglasses">نظارات شمسية</option>
              <option value="eyeglasses">نظارات طبية</option>
              <option value="lenses">عدسات لاصقة</option>
              <option value="accessories">إكسسوارات وعناية</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">الماركة:</label>
            <select [(ngModel)]="selectedBrand" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="all">كل العلامات</option>
              <option value="Cartier">Cartier</option>
              <option value="Gucci">Gucci</option>
              <option value="Tom Ford">Tom Ford</option>
              <option value="Ray-Ban">Ray-Ban</option>
              <option value="Prada">Prada</option>
              <option value="Saint Laurent">Saint Laurent</option>
            </select>
          </div>

          @if (searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all') {
            <button (click)="resetFilters()" class="btn-text-clear">
              <app-icon name="close" [size]="14"></app-icon>
              <span>مسح التصفية</span>
            </button>
          }
        </div>
      </div>

      <!-- Products Table Card -->
      <div class="table-card">
        @if (loading()) {
          <div class="state-container">
            <div class="loading-spinner"></div>
            <p>جارٍ تحميل كتالوج المنتجات...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="state-container error">
            <app-icon name="close" [size]="32"></app-icon>
            <p>{{ errorMessage() }}</p>
            <button (click)="loadProducts()" class="btn btn-outline btn-sm mt-3">إعادة المحاولة</button>
          </div>
        } @else if (products().length === 0) {
          <div class="state-container empty">
            <app-icon name="glasses" [size]="40"></app-icon>
            <h3>لا توجد منتجات مطابقة للبحث</h3>
            <p>يمكنك إضافة منتجات جديدة أو تعديل خيارات التصفية أعلاه</p>
            @if (searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all') {
              <button (click)="resetFilters()" class="btn btn-outline btn-sm mt-3">إلغاء التصفية</button>
            }
          </div>
        } @else {
          <div class="table-meta">
            <span>إجمالي المنتجات المعروضة: <strong>{{ products().length }}</strong> منتج</span>
          </div>

          <div class="table-wrapper">
            <table class="products-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الفئة</th>
                  <th>الماركة</th>
                  <th>السعر</th>
                  <th>المخزون الحالي</th>
                  <th>الوسوم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <!-- Product Info with Thumb -->
                    <td>
                      <div class="product-cell">
                        <img [src]="product.image" [alt]="product.name" class="prod-thumb" />
                        <div class="prod-names">
                          <span class="p-name">{{ product.nameAr || product.name }}</span>
                          <span class="p-sub font-mono text-muted">{{ product.sku }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Category -->
                    <td>
                      <span class="cat-tag">{{ formatCategory(product.category) }}</span>
                    </td>

                    <!-- Brand -->
                    <td class="font-bold">
                      {{ product.brand }}
                    </td>

                    <!-- Price -->
                    <td>
                      <div class="price-cell">
                        <span class="current-price font-mono font-bold">{{ product.price | number }} <span class="cur">ج.م</span></span>
                        @if (product.oldPrice) {
                          <span class="old-price font-mono">{{ product.oldPrice | number }} ج.م</span>
                        }
                      </div>
                    </td>

                    <!-- Stock Management -->
                    <td>
                      <div class="stock-ctrl">
                        <button
                          (click)="quickStockChange(product, -1)"
                          [disabled]="product.stock <= 0"
                          class="btn-stock-adj"
                          title="إنقاص المخزون بمقدار 1"
                        >
                          <app-icon name="minus" [size]="12"></app-icon>
                        </button>
                        <span class="stock-badge font-mono" [class.low-stock]="product.stock < 5" [class.out-of-stock]="product.stock === 0">
                          {{ product.stock }}
                        </span>
                        <button
                          (click)="quickStockChange(product, 1)"
                          class="btn-stock-adj"
                          title="زيادة المخزون بمقدار 1"
                        >
                          <app-icon name="plus" [size]="12"></app-icon>
                        </button>
                      </div>
                    </td>

                    <!-- Badges -->
                    <td>
                      <div class="tags-cluster">
                        @if (product.isFeatured) {
                          <span class="tag-pill featured">مميز</span>
                        }
                        @if (product.isNew) {
                          <span class="tag-pill new">جديد</span>
                        }
                        @if (product.isBestSeller) {
                          <span class="tag-pill best">الأكثر طلباً</span>
                        }
                      </div>
                    </td>

                    <!-- Actions -->
                    <td>
                      <div class="action-buttons">
                        <button
                          (click)="openEditModal(product)"
                          class="btn-icon"
                          title="تعديل المنتج"
                        >
                          <app-icon name="sparkles" [size]="14"></app-icon>
                        </button>

                        <button
                          (click)="deleteProduct(product)"
                          class="btn-icon danger"
                          title="حذف المنتج"
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

      <!-- Add / Edit Product Modal -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ isEditing() ? 'تعديل بيانات المنتج' : 'إضافة نظارة / منتج جديد' }}</h3>
              <button (click)="closeModal()" class="btn-close-modal">
                <app-icon name="close" [size]="18"></app-icon>
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" class="modal-form">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">الاسم بالعربية *</label>
                  <input type="text" [(ngModel)]="formProduct.nameAr" name="nameAr" required class="form-input" placeholder="مثال: نظارة كارتييه دي سينتوس الذهبية" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">الاسم بالإنجليزية *</label>
                  <input type="text" [(ngModel)]="formProduct.name" name="name" required class="form-input" placeholder="Cartier Santos-Dumont Gold" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">السعر الحالي (ج.م) *</label>
                  <input type="number" [(ngModel)]="formProduct.price" name="price" required min="1" class="form-input font-mono" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">السعر السابق قبل الخصم (اختياري)</label>
                  <input type="number" [(ngModel)]="formProduct.oldPrice" name="oldPrice" class="form-input font-mono" placeholder="اتركه فارغاً إن لم يكن هناك خصم" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">المخزون المتوفر *</label>
                  <input type="number" [(ngModel)]="formProduct.stock" name="stock" required min="0" class="form-input font-mono" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">التصنيف *</label>
                  <select [(ngModel)]="formProduct.category" name="category" required class="form-select">
                    <option value="sunglasses">نظارات شمسية</option>
                    <option value="eyeglasses">نظارات طبية</option>
                    <option value="lenses">عدسات لاصقة</option>
                    <option value="accessories">إكسسوارات وعناية</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">الماركة *</label>
                  <input type="text" [(ngModel)]="formProduct.brand" name="brand" required class="form-input" placeholder="Cartier, Gucci, Ray-Ban..." />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">رمز SKU *</label>
                  <input type="text" [(ngModel)]="formProduct.sku" name="sku" required class="form-input font-mono" placeholder="OPT-CRT-01" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">رابط صورة المنتج (URL) *</label>
                <input type="url" [(ngModel)]="formProduct.image" name="image" required class="form-input" placeholder="https://images.unsplash.com/..." />
              </div>

              <div class="form-group">
                <label class="form-label">وصف المنتج</label>
                <textarea [(ngModel)]="formProduct.descriptionAr" name="descriptionAr" rows="3" class="form-textarea" placeholder="وصف موجز للمواد، التصميم، والحماية..."></textarea>
              </div>

              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formProduct.isFeatured" name="isFeatured" />
                  <span>منتج مميز (Featured)</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formProduct.isNew" name="isNew" />
                  <span>وصل حديثاً (New Arrival)</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formProduct.isBestSeller" name="isBestSeller" />
                  <span>الأكثر مبيعاً (Best Seller)</span>
                </label>
              </div>

              <div class="modal-footer">
                <button type="button" (click)="closeModal()" class="btn btn-outline btn-sm">إلغاء</button>
                <button type="submit" [disabled]="saving()" class="btn btn-primary btn-sm">
                  @if (saving()) {
                    <span>جارٍ الحفظ...</span>
                  } @else {
                    <span>{{ isEditing() ? 'تحديث المنتج' : 'حفظ المنتج الجديد' }}</span>
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
    .products-mgmt-page {
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

    .products-table {
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
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #f0ebe1;
        font-size: 0.9rem;
        vertical-align: middle;
      }

      tbody tr:hover {
        background: #faf8f5;
      }
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .prod-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e8e3d9;
      background: #faf8f5;
    }

    .prod-names {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .p-name {
      font-weight: 600;
      color: #1a1a1a;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .p-sub {
      font-size: 0.75rem;
    }

    .cat-tag {
      background: #f5f1ea;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #666;
    }

    .price-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .current-price {
      color: #111;
    }

    .old-price {
      font-size: 0.75rem;
      color: #999;
      text-decoration: line-through;
    }

    /* Stock control */
    .stock-ctrl {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-stock-adj {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #d4cbb8;
      background: #faf8f5;
      color: #444;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: #c5a059;
        color: #fff;
        border-color: #c5a059;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .stock-badge {
      display: inline-block;
      min-width: 28px;
      text-align: center;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      background: #eafaf1;
      color: #27ae60;
      font-size: 0.85rem;

      &.low-stock {
        background: #fef5e7;
        color: #d68910;
      }

      &.out-of-stock {
        background: #fdedec;
        color: #c0392b;
      }
    }

    .tags-cluster {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .tag-pill {
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: 3px;
      font-weight: 600;

      &.featured { background: #fef9e7; color: #b7950b; }
      &.new { background: #ebf5fb; color: #2980b9; }
      &.best { background: #f4ecf7; color: #8e44ad; }
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
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
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
      font-size: 1.2rem;
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

      @media (max-width: 640px) {
        flex-direction: column;
      }
    }

    .flex-1 {
      flex: 1;
    }

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

    .form-input, .form-select, .form-textarea {
      width: 100%;
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

    .form-input, .form-select {
      height: 40px;
      padding: 0 0.75rem;
    }

    .form-textarea {
      padding: 0.6rem 0.75rem;
      resize: vertical;
    }

    .form-checkboxes {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      padding: 0.5rem 0;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #444;
      cursor: pointer;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e8e3d9;
    }

    /* Common utilities */
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-muted { color: #888; }
    .cur { font-size: 0.75rem; color: #888; font-weight: normal; }

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
export class AdminProductsComponent implements OnInit {
  private adminProductsService = inject(AdminProductsService);
  private storefrontProductService = inject(ProductService);

  products = signal<ProductDto[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  actionMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  searchQuery = '';
  selectedCategory = 'all';
  selectedBrand = 'all';

  modalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentEditingId: string | null = null;

  formProduct: ProductDto = this.getEmptyProduct();

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminProductsService
      .getAll({
        category: this.selectedCategory,
        brand: this.selectedBrand,
        search: this.searchQuery.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'تعذر تحميل المنتجات');
          this.loading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedBrand = 'all';
    this.loadProducts();
  }

  quickStockChange(product: ProductDto, change: number): void {
    if (!product.id) return;
    const newStock = product.stock + change;
    if (newStock < 0) return;

    this.adminProductsService.updateStock(product.id, change).subscribe({
      next: (res) => {
        this.products.update((list) =>
          list.map((p) => (p.id === product.id ? { ...p, stock: res.data.stock } : p))
        );
        this.storefrontProductService.refresh();
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'تعذر تعديل المخزون', 'error');
      },
    });
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.currentEditingId = null;
    this.formProduct = this.getEmptyProduct();
    this.modalOpen.set(true);
  }

  openEditModal(product: ProductDto): void {
    this.isEditing.set(true);
    this.currentEditingId = product.id || null;
    this.formProduct = { ...product };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  saveProduct(): void {
    this.saving.set(true);

    if (this.isEditing() && this.currentEditingId) {
      this.adminProductsService.update(this.currentEditingId, this.formProduct).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.closeModal();
          this.products.update((list) =>
            list.map((p) => (p.id === this.currentEditingId ? res.data : p))
          );
          this.storefrontProductService.refresh();
          this.showToast('تم تحديث المنتج بنجاح', 'success');
        },
        error: (err) => {
          this.saving.set(false);
          this.showToast(err?.error?.message || 'تعذر تحديث المنتج', 'error');
        },
      });
    } else {
      this.adminProductsService.create(this.formProduct).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.closeModal();
          this.products.update((list) => [res.data, ...list]);
          this.storefrontProductService.refresh();
          this.showToast('تمت إضافة المنتج بنجاح إلى المتجر', 'success');
        },
        error: (err) => {
          this.saving.set(false);
          this.showToast(err?.error?.message || 'تعذر إضافة المنتج', 'error');
        },
      });
    }
  }

  deleteProduct(product: ProductDto): void {
    if (!product.id) return;
    if (!confirm(`هل أنت متأكد من حذف المنتج "${product.nameAr || product.name}" نهائياً؟`)) return;

    this.adminProductsService.delete(product.id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== product.id));
        this.storefrontProductService.refresh();
        this.showToast('تم حذف المنتج بنجاح', 'success');
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'تعذر حذف المنتج', 'error');
      },
    });
  }

  private getEmptyProduct(): ProductDto {
    return {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 1500,
      oldPrice: null,
      discountPercent: null,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      category: 'sunglasses',
      brand: 'Gucci',
      stock: 10,
      sku: 'OPT-' + Math.floor(1000 + Math.random() * 9000),
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
    };
  }

  private showToast(text: string, type: 'success' | 'error'): void {
    this.actionMessage.set({ text, type });
    setTimeout(() => {
      this.actionMessage.set(null);
    }, 4000);
  }

  formatCategory(category: string): string {
    const map: Record<string, string> = {
      sunglasses: 'نظارات شمسية',
      eyeglasses: 'نظارات طبية',
      lenses: 'عدسات لاصقة',
      accessories: 'إكسسوارات',
    };
    return map[category] || category;
  }
}
