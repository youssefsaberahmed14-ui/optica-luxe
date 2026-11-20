import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FilterState, FrameMaterial, FrameShape, Gender, Product, ProductCategory } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="products-page">
      <!-- Breadcrumb & Page Header -->
      <section class="catalog-header">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a routerLink="/">الرئيسية</a>
            <span class="sep">/</span>
            <span class="current">{{ pageTitle() }}</span>
          </nav>

          <div class="header-titles">
            <h1 class="page-title">{{ pageTitle() }}</h1>
            <p class="page-subtitle">
              تشكيلة استثنائية من النظارات الأصلية والإطارات الحصرية المختارة بعناية فائقة
            </p>
          </div>
        </div>
      </section>

      <div class="container catalog-body">
        <!-- Mobile Filters Button -->
        <div class="mobile-filter-bar">
          <button (click)="toggleMobileFilter(true)" class="btn btn-outline filter-trigger-btn">
            <app-icon name="filter" [size]="16"></app-icon>
            <span>تصفية النتائج ({{ activeFiltersCount() }})</span>
          </button>

          <div class="sort-select-wrap">
            <label>ترتيب:</label>
            <select [ngModel]="filters.sortBy" (ngModelChange)="onSortChange($event)" class="sort-select">
              <option value="featured">المميز أولاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="newest">الأحدث وصولاً</option>
            </select>
          </div>
        </div>

        <div class="catalog-layout">
          <!-- Sidebar Filters (Desktop & Mobile Drawer) -->
          <aside class="filters-sidebar" [class.mobile-open]="isMobileFilterOpen()">
            <div class="filters-header">
              <div class="title-wrap">
                <app-icon name="filter" [size]="18" class="gold-icon"></app-icon>
                <h3>تصفية المنتجات</h3>
              </div>
              <button (click)="toggleMobileFilter(false)" class="close-filter-btn" aria-label="إغلاق التصفية">
                <app-icon name="close" [size]="18"></app-icon>
              </button>
            </div>

            <!-- Clear All if active filters -->
            @if (activeFiltersCount() > 0) {
              <div class="reset-filters-bar">
                <button (click)="resetFilters()" class="btn-reset">
                  <app-icon name="rotate-ccw" [size]="14"></app-icon>
                  <span>إعادة ضبط كل الفلاتر</span>
                </button>
              </div>
            }

            <div class="filter-groups-list">
              <!-- Search query in page -->
              <div class="filter-group">
                <h4 class="filter-title">البحث في التشكيلة</h4>
                <div class="search-box-input">
                  <input
                    type="text"
                    [(ngModel)]="filters.searchQuery"
                    (ngModelChange)="applyFilters()"
                    placeholder="ابحث بالاسم أو الماركة..."
                    class="form-input"
                  />
                  @if (filters.searchQuery) {
                    <button (click)="clearSearch()" class="clear-search-btn">&times;</button>
                  }
                </div>
              </div>

              <!-- 1. Categories -->
              <div class="filter-group">
                <h4 class="filter-title">الفئات والتشكيلات</h4>
                <div class="options-list">
                  <label class="radio-option" [class.selected]="filters.category === 'all'">
                    <input
                      type="radio"
                      name="cat"
                      value="all"
                      [checked]="filters.category === 'all'"
                      (change)="onCategoryChange('all')"
                    />
                    <span>جميع التشكيلات</span>
                  </label>
                  <label class="radio-option" [class.selected]="filters.category === 'sunglasses'">
                    <input
                      type="radio"
                      name="cat"
                      value="sunglasses"
                      [checked]="filters.category === 'sunglasses'"
                      (change)="onCategoryChange('sunglasses')"
                    />
                    <span>نظارات شمسية فاخرة</span>
                  </label>
                  <label class="radio-option" [class.selected]="filters.category === 'eyeglasses'">
                    <input
                      type="radio"
                      name="cat"
                      value="eyeglasses"
                      [checked]="filters.category === 'eyeglasses'"
                      (change)="onCategoryChange('eyeglasses')"
                    />
                    <span>نظارات طبية ذكية</span>
                  </label>
                  <label class="radio-option" [class.selected]="filters.category === 'luxury-frames'">
                    <input
                      type="radio"
                      name="cat"
                      value="luxury-frames"
                      [checked]="filters.category === 'luxury-frames'"
                      (change)="onCategoryChange('luxury-frames')"
                    />
                    <span>إطارات مطلية بالذهب</span>
                  </label>
                  <label class="radio-option" [class.selected]="filters.category === 'contact-lenses'">
                    <input
                      type="radio"
                      name="cat"
                      value="contact-lenses"
                      [checked]="filters.category === 'contact-lenses'"
                      (change)="onCategoryChange('contact-lenses')"
                    />
                    <span>عدسات لاصقة</span>
                  </label>
                  <label class="radio-option" [class.selected]="filters.category === 'accessories'">
                    <input
                      type="radio"
                      name="cat"
                      value="accessories"
                      [checked]="filters.category === 'accessories'"
                      (change)="onCategoryChange('accessories')"
                    />
                    <span>حقائب وإكسسوارات</span>
                  </label>
                </div>
              </div>

              <!-- 2. Brands -->
              <div class="filter-group">
                <h4 class="filter-title">الماركات العالمية</h4>
                <div class="options-list brands-list">
                  <label class="radio-option" [class.selected]="filters.brand === 'all'">
                    <input
                      type="radio"
                      name="brand"
                      value="all"
                      [checked]="filters.brand === 'all'"
                      (change)="onBrandChange('all')"
                    />
                    <span>كافة الماركات</span>
                  </label>
                  @for (brand of availableBrands(); track brand.name) {
                    <label class="radio-option" [class.selected]="filters.brand === brand.name">
                      <input
                        type="radio"
                        name="brand"
                        [value]="brand.name"
                        [checked]="filters.brand === brand.name"
                        (change)="onBrandChange(brand.name)"
                      />
                      <span>{{ brand.nameAr }} ({{ brand.name }})</span>
                      <span class="count-tag">{{ brand.count }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- 3. Frame Shapes -->
              <div class="filter-group">
                <h4 class="filter-title">شكل الإطار</h4>
                <div class="shapes-chips">
                  <button
                    (click)="onShapeChange('all')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'all'"
                  >
                    الكل
                  </button>
                  <button
                    (click)="onShapeChange('aviator')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'aviator'"
                  >
                    أفياتور
                  </button>
                  <button
                    (click)="onShapeChange('square')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'square'"
                  >
                    مربع
                  </button>
                  <button
                    (click)="onShapeChange('round')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'round'"
                  >
                    دائري
                  </button>
                  <button
                    (click)="onShapeChange('cat-eye')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'cat-eye'"
                  >
                    عين القطة
                  </button>
                  <button
                    (click)="onShapeChange('hexagonal')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'hexagonal'"
                  >
                    سداسي
                  </button>
                  <button
                    (click)="onShapeChange('rectangle')"
                    class="chip-btn"
                    [class.active]="filters.shape === 'rectangle'"
                  >
                    مستطيل
                  </button>
                </div>
              </div>

              <!-- 4. Frame Material -->
              <div class="filter-group">
                <h4 class="filter-title">مادة الصنع</h4>
                <div class="shapes-chips">
                  <button
                    (click)="onMaterialChange('all')"
                    class="chip-btn"
                    [class.active]="filters.material === 'all'"
                  >
                    الكل
                  </button>
                  <button
                    (click)="onMaterialChange('titanium')"
                    class="chip-btn"
                    [class.active]="filters.material === 'titanium'"
                  >
                    تيتانيوم نقي
                  </button>
                  <button
                    (click)="onMaterialChange('gold-plated')"
                    class="chip-btn"
                    [class.active]="filters.material === 'gold-plated'"
                  >
                    معدن مذهب
                  </button>
                  <button
                    (click)="onMaterialChange('acetate')"
                    class="chip-btn"
                    [class.active]="filters.material === 'acetate'"
                  >
                    أسيتات إيطالي
                  </button>
                  <button
                    (click)="onMaterialChange('carbon-fiber')"
                    class="chip-btn"
                    [class.active]="filters.material === 'carbon-fiber'"
                  >
                    ألياف كربونية
                  </button>
                </div>
              </div>

              <!-- 5. Price Range Slider -->
              <div class="filter-group">
                <div class="price-header">
                  <h4 class="filter-title">نطاق السعر</h4>
                  <span class="price-indicator">حتى {{ currentMaxPrice() }} ج.م</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="6000"
                  step="100"
                  [ngModel]="currentMaxPrice()"
                  (ngModelChange)="onPriceSliderChange($event)"
                  class="price-slider"
                />
                <div class="price-min-max">
                  <span>200 ج.م</span>
                  <span>6,000 ج.م</span>
                </div>
              </div>

              <!-- 6. Special toggles -->
              <div class="filter-group">
                <label class="checkbox-option">
                  <input
                    type="checkbox"
                    [checked]="filters.onlyDiscounted"
                    (change)="toggleDiscounted($event)"
                  />
                  <span>العروض والتخفيضات فقط</span>
                </label>
                <label class="checkbox-option mt-2">
                  <input
                    type="checkbox"
                    [checked]="filters.onlyNew"
                    (change)="toggleNew($event)"
                  />
                  <span>وصل حديثاً فقط</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Main Catalog Content -->
          <main class="catalog-main">
            <!-- Toolbar: Results count, active chips, layout toggles -->
            <div class="catalog-toolbar">
              <div class="results-count">
                <span>عرض <strong>{{ filteredProducts().length }}</strong> منتج من أصل {{ allProductsCount() }}</span>
              </div>

              <div class="toolbar-actions">
                <!-- Grid / List switch -->
                <div class="view-switcher">
                  <button
                    (click)="isListView.set(false)"
                    class="switch-btn"
                    [class.active]="!isListView()"
                    title="عرض شبكي"
                    aria-label="عرض شبكي"
                  >
                    <app-icon name="grid" [size]="18"></app-icon>
                  </button>
                  <button
                    (click)="isListView.set(true)"
                    class="switch-btn"
                    [class.active]="isListView()"
                    title="عرض قائمة"
                    aria-label="عرض قائمة"
                  >
                    <app-icon name="list" [size]="18"></app-icon>
                  </button>
                </div>

                <!-- Desktop Sort -->
                <div class="desktop-sort">
                  <span class="sort-label">ترتيب حسب:</span>
                  <select [ngModel]="filters.sortBy" (ngModelChange)="onSortChange($event)" class="sort-select">
                    <option value="featured">المميز أولاً</option>
                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="newest">الأحدث وصولاً</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Active Filter Badges / Chips -->
            @if (hasActiveFilters()) {
              <div class="active-chips-row">
                <span class="chips-title">الفلاتر المطبقة:</span>

                @if (filters.category && filters.category !== 'all') {
                  <span class="filter-chip">
                    فئة: {{ getCategoryLabel(filters.category) }}
                    <button (click)="onCategoryChange('all')">&times;</button>
                  </span>
                }

                @if (filters.brand && filters.brand !== 'all') {
                  <span class="filter-chip">
                    ماركة: {{ filters.brand }}
                    <button (click)="onBrandChange('all')">&times;</button>
                  </span>
                }

                @if (filters.shape && filters.shape !== 'all') {
                  <span class="filter-chip">
                    شكل: {{ getShapeLabel(filters.shape) }}
                    <button (click)="onShapeChange('all')">&times;</button>
                  </span>
                }

                @if (filters.material && filters.material !== 'all') {
                  <span class="filter-chip">
                    مادة: {{ getMaterialLabel(filters.material) }}
                    <button (click)="onMaterialChange('all')">&times;</button>
                  </span>
                }

                @if (filters.maxPrice && filters.maxPrice < 6000) {
                  <span class="filter-chip">
                    أقصى سعر: {{ filters.maxPrice }} ج.م
                    <button (click)="onPriceSliderChange(6000)">&times;</button>
                  </span>
                }

                @if (filters.searchQuery) {
                  <span class="filter-chip">
                    بحث: "{{ filters.searchQuery }}"
                    <button (click)="clearSearch()">&times;</button>
                  </span>
                }

                @if (filters.onlyDiscounted) {
                  <span class="filter-chip">
                    التخفيضات فقط
                    <button (click)="filters.onlyDiscounted = false; applyFilters()">&times;</button>
                  </span>
                }

                <button (click)="resetFilters()" class="clear-all-chip">مسح الكل</button>
              </div>
            }

            <!-- Products Output -->
            @if (productService.isLoading()) {
              <div class="loading-results-box" style="text-align: center; padding: 4rem 1rem;">
                <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(212,175,55,0.2); border-top-color: #d4af37; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <p style="margin-top: 1rem; color: #888;">جاري تحميل تشكيلة النظارات الفاخرة...</p>
              </div>
            } @else if (productService.error()) {
              <div class="empty-results-box">
                <div class="empty-icon-wrap">
                  <app-icon name="close" [size]="52" class="gold-icon"></app-icon>
                </div>
                <h3>تعذر الاتصال بكتالوج المنتجات</h3>
                <p>{{ productService.error() }}</p>
                <button (click)="productService.refresh()" class="btn btn-gold">
                  <span>إعادة المحاولة</span>
                  <app-icon name="rotate-ccw" [size]="16"></app-icon>
                </button>
              </div>
            } @else if (filteredProducts().length === 0) {
              <div class="empty-results-box">
                <div class="empty-icon-wrap">
                  <app-icon name="glasses" [size]="52" class="gold-icon"></app-icon>
                </div>
                <h3>لم نجد منتجات تطابق هذه الخيارات</h3>
                <p>جرب إزالة بعض الفلاتر أو تعديل نطاق السعر للاطلاع على باقي التشكيلة الفاخرة.</p>
                <button (click)="resetFilters()" class="btn btn-gold">
                  <span>إعادة ضبط الفلاتر</span>
                  <app-icon name="rotate-ccw" [size]="16"></app-icon>
                </button>
              </div>
            } @else {
              <div class="catalog-grid" [class.list-view]="isListView()">
                @for (prod of filteredProducts(); track prod.id) {
                  <app-product-card [product]="prod" [isListView]="isListView()"></app-product-card>
                }
              </div>
            }
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-header {
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border);
      padding: 2.5rem 0 3rem;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--c-muted);
      margin-bottom: 1rem;

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
      margin-bottom: 0.4rem;
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--c-muted);
      max-width: 600px;
    }

    .catalog-body {
      padding: 3rem 1.5rem;
    }

    .mobile-filter-bar {
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .catalog-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    /* Filters Sidebar */
    .filters-sidebar {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 1.5rem;
      position: sticky;
      top: 100px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }

    .filters-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--c-border-light);

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        h3 {
          font-size: 1.05rem;
          font-weight: 800;
        }
      }

      .close-filter-btn {
        display: none;
      }
    }

    .reset-filters-bar {
      margin-bottom: 1.25rem;

      .btn-reset {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--c-gold-dark);

        &:hover {
          color: var(--c-dark);
        }
      }
    }

    .filter-groups-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filter-group {
      .filter-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--c-dark);
        margin-bottom: 0.75rem;
      }
    }

    .search-box-input {
      position: relative;

      .clear-search-btn {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
        color: var(--c-muted);
      }
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &.brands-list {
        max-height: 200px;
        overflow-y: auto;
        padding-left: 0.25rem;
      }
    }

    .radio-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.86rem;
      color: var(--c-dark-secondary);
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: var(--radius-sm);
      transition: background 0.2s;

      input {
        accent-color: var(--c-gold);
      }

      &:hover {
        background-color: var(--c-surface-soft);
      }

      &.selected {
        font-weight: 700;
        color: var(--c-dark);
        background-color: var(--c-gold-light);
      }

      .count-tag {
        font-size: 0.75rem;
        color: var(--c-muted-light);
      }
    }

    .shapes-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;

      .chip-btn {
        padding: 0.35rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 600;
        background: var(--c-surface-soft);
        border: 1px solid var(--c-border);
        border-radius: var(--radius-sm);
        color: var(--c-dark-secondary);
        transition: all 0.2s;

        &:hover {
          border-color: var(--c-gold);
        }

        &.active {
          background-color: var(--c-dark);
          color: #FFFFFF;
          border-color: var(--c-dark);
        }
      }
    }

    .price-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      .price-indicator {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--c-gold-dark);
      }
    }

    .price-slider {
      width: 100%;
      accent-color: var(--c-gold);
    }

    .price-min-max {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--c-muted);
      margin-top: 0.25rem;
    }

    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--c-dark);
      cursor: pointer;

      input {
        accent-color: var(--c-gold);
        width: 16px;
        height: 16px;
      }
    }

    .mt-2 {
      margin-top: 0.5rem;
    }

    /* Main Toolbar */
    .catalog-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--c-border);
    }

    .results-count {
      font-size: 0.92rem;
      color: var(--c-muted);

      strong {
        color: var(--c-dark);
      }
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .view-switcher {
      display: flex;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      overflow: hidden;

      .switch-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #FFFFFF;
        color: var(--c-muted);

        &.active {
          background-color: var(--c-dark);
          color: #FFFFFF;
        }
      }
    }

    .desktop-sort {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .sort-label {
        font-size: 0.86rem;
        color: var(--c-muted);
        font-weight: 600;
      }
    }

    .sort-select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      background-color: #FFFFFF;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--c-dark);
      outline: none;

      &:focus {
        border-color: var(--c-gold);
      }
    }

    /* Active Chips */
    .active-chips-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.75rem;

      .chips-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--c-muted);
      }

      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.75rem;
        background-color: var(--c-gold-light);
        border: 1px solid rgba(197, 168, 128, 0.4);
        border-radius: var(--radius-full);
        font-size: 0.78rem;
        color: var(--c-gold-dark);
        font-weight: 600;

        button {
          font-size: 1.1rem;
          color: var(--c-muted);
          line-height: 1;

          &:hover {
            color: var(--c-danger);
          }
        }
      }

      .clear-all-chip {
        font-size: 0.78rem;
        color: var(--c-danger);
        text-decoration: underline;
        font-weight: 700;
        cursor: pointer;
      }
    }

    /* Catalog Grid */
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;

      &.list-view {
        grid-template-columns: 1fr;
      }
    }

    .empty-results-box {
      text-align: center;
      padding: 4rem 2rem;
      background: #FFFFFF;
      border: 1px dashed var(--c-border);
      border-radius: var(--radius-sm);

      .empty-icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: var(--c-gold-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.25rem auto;
      }

      h3 {
        font-size: 1.35rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.95rem;
        color: var(--c-muted);
        max-width: 420px;
        margin: 0 auto 1.5rem auto;
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    @media (max-width: 1024px) {
      .catalog-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 900px) {
      .catalog-layout {
        grid-template-columns: 1fr;
      }

      .mobile-filter-bar {
        display: flex;
      }

      .desktop-sort {
        display: none;
      }

      .filters-sidebar {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 85%;
        max-width: 360px;
        z-index: 200;
        max-height: 100vh;
        box-shadow: var(--shadow-drawer);

        &.mobile-open {
          display: block;
        }

        .close-filter-btn {
          display: block;
        }
      }
    }

    @media (max-width: 600px) {
      .catalog-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  filters: FilterState = {
    category: 'all',
    brand: 'all',
    shape: 'all',
    material: 'all',
    gender: 'all',
    minPrice: 0,
    maxPrice: 6000,
    searchQuery: '',
    onlyDiscounted: false,
    onlyNew: false,
    sortBy: 'featured',
  };

  allProductsCount = computed(() => this.productService.products().length);
  availableBrands = computed(() => this.productService.getAllBrands());
  filteredProducts = signal<Product[]>([]);
  isListView = signal<boolean>(false);
  isMobileFilterOpen = signal<boolean>(false);
  currentMaxPrice = signal<number>(6000);

  pageTitle = signal<string>('جميع النظارات والإطارات الفاخرة');

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.filters.category = params['category'] as ProductCategory;
      }
      if (params['brand']) {
        this.filters.brand = params['brand'];
      }
      if (params['q']) {
        this.filters.searchQuery = params['q'];
      }
      if (params['onlyNew']) {
        this.filters.onlyNew = params['onlyNew'] === 'true';
      }
      if (params['sortBy']) {
        this.filters.sortBy = params['sortBy'];
      }
      this.updatePageTitle();
      this.applyFilters();
    });

    this.productService.loadProducts().subscribe({
      next: () => this.applyFilters(),
      error: () => {},
    });
  }

  updatePageTitle(): void {
    if (this.filters.category === 'sunglasses') {
      this.pageTitle.set('تشكيلة النظارات الشمسية الفاخرة');
    } else if (this.filters.category === 'eyeglasses') {
      this.pageTitle.set('النظارات الطبية والإطارات الذكية');
    } else if (this.filters.category === 'luxury-frames') {
      this.pageTitle.set('إطارات حصرية ومطلية بالذهب عيار 18');
    } else if (this.filters.category === 'contact-lenses') {
      this.pageTitle.set('العدسات اللاصقة التجميلية والطبية');
    } else if (this.filters.category === 'accessories') {
      this.pageTitle.set('الحقائب الجلدية ومجموعات العناية');
    } else if (this.filters.onlyNew) {
      this.pageTitle.set('أحدث إصدارات الموسم الجديد 2026');
    } else {
      this.pageTitle.set('جميع النظارات والإطارات الفاخرة');
    }
  }

  applyFilters(): void {
    const results = this.productService.filterProducts(this.filters);
    this.filteredProducts.set(results);
  }

  onCategoryChange(cat: ProductCategory | 'all'): void {
    this.filters.category = cat;
    this.updatePageTitle();
    this.applyFilters();
  }

  onBrandChange(brand: string): void {
    this.filters.brand = brand;
    this.applyFilters();
  }

  onShapeChange(shape: FrameShape | 'all'): void {
    this.filters.shape = shape;
    this.applyFilters();
  }

  onMaterialChange(material: FrameMaterial | 'all'): void {
    this.filters.material = material;
    this.applyFilters();
  }

  onPriceSliderChange(val: number): void {
    this.currentMaxPrice.set(val);
    this.filters.maxPrice = val;
    this.applyFilters();
  }

  toggleDiscounted(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filters.onlyDiscounted = input.checked;
    this.applyFilters();
  }

  toggleNew(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filters.onlyNew = input.checked;
    this.applyFilters();
  }

  onSortChange(sortBy: any): void {
    this.filters.sortBy = sortBy;
    this.applyFilters();
  }

  clearSearch(): void {
    this.filters.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      category: 'all',
      brand: 'all',
      shape: 'all',
      material: 'all',
      gender: 'all',
      minPrice: 0,
      maxPrice: 6000,
      searchQuery: '',
      onlyDiscounted: false,
      onlyNew: false,
      sortBy: 'featured',
    };
    this.currentMaxPrice.set(6000);
    this.updatePageTitle();
    this.applyFilters();
  }

  toggleMobileFilter(open: boolean): void {
    this.isMobileFilterOpen.set(open);
  }

  activeFiltersCount(): number {
    let count = 0;
    if (this.filters.category && this.filters.category !== 'all') count++;
    if (this.filters.brand && this.filters.brand !== 'all') count++;
    if (this.filters.shape && this.filters.shape !== 'all') count++;
    if (this.filters.material && this.filters.material !== 'all') count++;
    if (this.filters.maxPrice && this.filters.maxPrice < 6000) count++;
    if (this.filters.searchQuery) count++;
    if (this.filters.onlyDiscounted) count++;
    if (this.filters.onlyNew) count++;
    return count;
  }

  hasActiveFilters(): boolean {
    return this.activeFiltersCount() > 0;
  }

  getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      sunglasses: 'نظارات شمسية',
      eyeglasses: 'نظارات طبية',
      'luxury-frames': 'إطارات فاخرة',
      'contact-lenses': 'عدسات لاصقة',
      accessories: 'إكسسوارات',
    };
    return map[cat] || cat;
  }

  getShapeLabel(shape: string): string {
    const map: Record<string, string> = {
      aviator: 'أفياتور',
      square: 'مربع',
      round: 'دائري',
      'cat-eye': 'عين القطة',
      hexagonal: 'سداسي',
      rectangle: 'مستطيل',
    };
    return map[shape] || shape;
  }

  getMaterialLabel(material: string): string {
    const map: Record<string, string> = {
      titanium: 'تيتانيوم',
      'gold-plated': 'معدن مذهب',
      acetate: 'أسيتات',
      'carbon-fiber': 'ألياف كربونية',
    };
    return map[material] || material;
  }
}

