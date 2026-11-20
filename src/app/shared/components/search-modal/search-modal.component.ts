import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { SearchModalService } from '../../../core/services/search-modal.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (searchService.isOpen()) {
      <div class="search-backdrop" (click)="close()">
        <div class="search-panel animate-fade-in" (click)="$event.stopPropagation()">
          <!-- Top bar with input -->
          <div class="search-input-box">
            <app-icon name="search" [size]="24" class="search-icon"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="ابحث بالاسم، الماركة، نوع الإطار أو المواصفات..."
              class="search-input"
              autofocus
            />
            <button (click)="close()" class="btn-icon" aria-label="إغلاق البحث">
              <app-icon name="close" [size]="20"></app-icon>
            </button>
          </div>

          <!-- Quick tags -->
          <div class="quick-tags-row">
            <span class="tags-label">الأكثر بحثاً:</span>
            <button (click)="setQuery('كارتييه')" class="tag-pill">كارتييه ذهب</button>
            <button (click)="setQuery('توم فورد')" class="tag-pill">توم فورد سنودون</button>
            <button (click)="setQuery('تيتانيوم')" class="tag-pill">إطارات تيتانيوم</button>
            <button (click)="setQuery('بيرسول')" class="tag-pill">بيرسول 714</button>
            <button (click)="setQuery('عدسات')" class="tag-pill">عدسات هيدرالوكس</button>
          </div>

          <!-- Results Box -->
          <div class="search-results-area">
            @if (searchQuery.trim() !== '') {
              <div class="results-meta">
                <span>نتائج البحث عن "<strong>{{ searchQuery }}</strong>" ({{ filteredResults().length }})</span>
                @if (filteredResults().length > 0) {
                  <button (click)="viewAllResults()" class="view-all-link">عرض كل النتائج في صفحة المنتجات</button>
                }
              </div>

              @if (filteredResults().length === 0) {
                <div class="no-results">
                  <app-icon name="glasses" [size]="36" class="gold-icon"></app-icon>
                  <p>لم نجد نتائج تطابق بحثك. جرب كتابة اسم ماركة أو شكل إطار مختلف.</p>
                </div>
              } @else {
                <div class="results-grid">
                  @for (prod of filteredResults(); track prod.id) {
                    <a [routerLink]="['/products', prod.id]" (click)="close()" class="result-item">
                      <div class="result-img">
                        <img [src]="prod.thumbnail" [alt]="prod.nameAr" />
                      </div>
                      <div class="result-info">
                        <span class="result-brand">{{ prod.brandAr }}</span>
                        <h4 class="result-title">{{ prod.nameAr }}</h4>
                        <div class="result-price">
                          <span class="current">{{ prod.price }} ج.م</span>
                          @if (prod.oldPrice) {
                            <span class="old">{{ prod.oldPrice }} ج.م</span>
                          }
                        </div>
                      </div>
                      <app-icon name="arrow-left" [size]="16" class="arrow-icon"></app-icon>
                    </a>
                  }
                </div>
              }
            } @else {
              <!-- Featured Recommendations when empty -->
              <div class="empty-prompt">
                <h5>المختارات الفاخرة لهذا الأسبوع</h5>
                <div class="results-grid">
                  @for (prod of featuredList(); track prod.id) {
                    <a [routerLink]="['/products', prod.id]" (click)="close()" class="result-item">
                      <div class="result-img">
                        <img [src]="prod.thumbnail" [alt]="prod.nameAr" />
                      </div>
                      <div class="result-info">
                        <span class="result-brand">{{ prod.brandAr }}</span>
                        <h4 class="result-title">{{ prod.nameAr }}</h4>
                        <span class="current">{{ prod.price }} ج.م</span>
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .search-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 18, 18, 0.7);
      backdrop-filter: blur(8px);
      z-index: 250;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem 1.5rem;
    }

    .search-panel {
      width: 100%;
      max-width: 780px;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--c-border);

      .search-icon {
        color: var(--c-gold);
      }

      .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 1.15rem;
        color: var(--c-dark);
        font-weight: 500;

        &::placeholder {
          color: var(--c-muted-light);
        }
      }
    }

    .quick-tags-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 1.5rem;
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border-light);
      flex-wrap: wrap;

      .tags-label {
        font-size: 0.8rem;
        color: var(--c-muted);
        font-weight: 600;
      }

      .tag-pill {
        background: #FFFFFF;
        border: 1px solid var(--c-border);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
        font-size: 0.78rem;
        color: var(--c-dark-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--c-gold);
          color: var(--c-gold-dark);
          background-color: var(--c-gold-light);
        }
      }
    }

    .search-results-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .results-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.88rem;
      color: var(--c-muted);

      strong {
        color: var(--c-dark);
      }

      .view-all-link {
        color: var(--c-gold-dark);
        font-weight: 600;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .no-results {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--c-muted);

      p {
        margin-top: 0.75rem;
        font-size: 0.95rem;
      }
    }

    .empty-prompt {
      h5 {
        font-size: 0.88rem;
        color: var(--c-gold-dark);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 1rem;
      }
    }

    .results-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--c-border-light);
      background: #FFFFFF;
      transition: all 0.2s;

      &:hover {
        border-color: var(--c-gold);
        background-color: var(--c-surface-soft);
        transform: translateX(-4px);

        .arrow-icon {
          color: var(--c-gold-dark);
        }
      }

      .result-img {
        width: 60px;
        height: 60px;
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

      .result-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .result-brand {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--c-gold-dark);
          text-transform: uppercase;
        }

        .result-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--c-dark);
        }

        .result-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;

          .current {
            font-weight: 800;
            color: var(--c-dark);
          }
          .old {
            font-size: 0.78rem;
            color: var(--c-muted-light);
            text-decoration: line-through;
          }
        }
      }

      .arrow-icon {
        color: var(--c-muted-light);
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }
  `]
})
export class SearchModalComponent {
  searchService = inject(SearchModalService);
  private productService = inject(ProductService);
  private router = inject(Router);

  searchQuery = '';
  filteredResults = signal<Product[]>([]);
  featuredList = signal<Product[]>(this.productService.products().slice(0, 4));

  close(): void {
    this.searchService.close();
    this.searchQuery = '';
  }

  onSearchChange(query: string): void {
    if (!query || query.trim() === '') {
      this.filteredResults.set([]);
      return;
    }
    const results = this.productService.filterProducts({
      searchQuery: query,
    });
    this.filteredResults.set(results);
  }

  setQuery(q: string): void {
    this.searchQuery = q;
    this.onSearchChange(q);
  }

  viewAllResults(): void {
    const q = this.searchQuery;
    this.close();
    this.router.navigate(['/products'], { queryParams: { q } });
  }
}

