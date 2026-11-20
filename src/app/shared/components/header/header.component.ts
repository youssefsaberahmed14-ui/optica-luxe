import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SearchModalService } from '../../../core/services/search-modal.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header" [class.scrolled]="isScrolled()">
      <div class="container header-container">
        <!-- Mobile Menu Toggle Button -->
        <button class="mobile-toggle-btn" (click)="toggleMobileMenu()" aria-label="القائمة">
          <app-icon [name]="mobileMenuOpen() ? 'close' : 'menu'" [size]="24"></app-icon>
        </button>

        <!-- Brand Logo -->
        <a routerLink="/" class="brand-logo" (click)="closeMobileMenu()">
          <span class="logo-sub font-brand">HAUTE LUNETTERIE</span>
          <span class="logo-main">
            <span class="logo-ar">أوبتيكا لاكشري</span>
            <span class="logo-dot"></span>
            <span class="logo-en font-brand">OPTICA LUXE</span>
          </span>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="desktop-nav">
          <ul class="nav-list">
            <li>
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">الرئيسية</a>
            </li>
            <li>
              <a routerLink="/products" [queryParams]="{ category: 'sunglasses' }" routerLinkActive="active" class="nav-link">نظارات شمسية</a>
            </li>
            <li>
              <a routerLink="/products" [queryParams]="{ category: 'eyeglasses' }" routerLinkActive="active" class="nav-link">نظارات طبية</a>
            </li>
            <li>
              <a routerLink="/products" [queryParams]="{ category: 'luxury-frames' }" routerLinkActive="active" class="nav-link">إطارات فاخرة</a>
            </li>
            <li>
              <a routerLink="/products" [queryParams]="{ category: 'contact-lenses' }" routerLinkActive="active" class="nav-link">عدسات لاصقة</a>
            </li>
            <li>
              <a routerLink="/contact" routerLinkActive="active" class="nav-link">فروعنا وتواصل معنا</a>
            </li>
          </ul>
        </nav>

        <!-- Action Icons (Search, Wishlist, Cart) -->
        <div class="header-actions">
          <!-- Search trigger -->
          <button (click)="openSearch()" class="action-btn" title="البحث عن منتج" aria-label="بحث">
            <app-icon name="search" [size]="20"></app-icon>
          </button>

          <!-- Wishlist link -->
          <a routerLink="/wishlist" class="action-btn" title="قائمة الرغبات" aria-label="المفضلة">
            <app-icon name="heart" [size]="20"></app-icon>
            @if (wishlistService.count() > 0) {
              <span class="action-badge">{{ wishlistService.count() }}</span>
            }
          </a>

          <!-- Cart drawer trigger -->
          <button (click)="openCart()" class="action-btn cart-btn" title="سلة المشتريات" aria-label="السلة">
            <app-icon name="cart" [size]="21"></app-icon>
            @if (cartService.totalItemCount() > 0) {
              <span class="action-badge">{{ cartService.totalItemCount() }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Mobile Slide-out Menu Backdrop & Drawer -->
      @if (mobileMenuOpen()) {
        <div class="mobile-backdrop" (click)="closeMobileMenu()"></div>
        <div class="mobile-drawer animate-fade-in">
          <div class="drawer-header">
            <div class="drawer-title">
              <span class="logo-ar">أوبتيكا لاكشري</span>
              <span class="logo-sub font-brand">OPTICA LUXE</span>
            </div>
            <button (click)="closeMobileMenu()" class="btn-icon">
              <app-icon name="close" [size]="20"></app-icon>
            </button>
          </div>

          <nav class="mobile-nav-list">
            <a routerLink="/" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="glasses" [size]="18" class="gold-icon"></app-icon>
              <span>الصفحة الرئيسية</span>
            </a>
            <a routerLink="/products" [queryParams]="{ category: 'all' }" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="sparkles" [size]="18" class="gold-icon"></app-icon>
              <span>كل التشكيلة</span>
            </a>
            <a routerLink="/products" [queryParams]="{ category: 'sunglasses' }" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="sparkles" [size]="18" class="gold-icon"></app-icon>
              <span>نظارات شمسية فاخرة</span>
            </a>
            <a routerLink="/products" [queryParams]="{ category: 'eyeglasses' }" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="glasses" [size]="18" class="gold-icon"></app-icon>
              <span>نظارات طبية وهندسية</span>
            </a>
            <a routerLink="/products" [queryParams]="{ category: 'luxury-frames' }" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="award" [size]="18" class="gold-icon"></app-icon>
              <span>إطارات حصرية ومطلية بالذهب</span>
            </a>
            <a routerLink="/products" [queryParams]="{ category: 'contact-lenses' }" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="eye" [size]="18" class="gold-icon"></app-icon>
              <span>عدسات لاصقة تجميلية وطبية</span>
            </a>
            <a routerLink="/wishlist" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="heart" [size]="18" class="gold-icon"></app-icon>
              <span>المفضلة ({{ wishlistService.count() }})</span>
            </a>
            <a routerLink="/cart" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="cart" [size]="18" class="gold-icon"></app-icon>
              <span>سلة المشتريات ({{ cartService.totalItemCount() }})</span>
            </a>
            <a routerLink="/contact" (click)="closeMobileMenu()" class="mobile-nav-link">
              <app-icon name="map-pin" [size]="18" class="gold-icon"></app-icon>
              <span>فروعنا وحجز فحص النظر</span>
            </a>
          </nav>

          <div class="drawer-footer">
            <p class="service-text">خدمة المساعد الشخصي للبصريات</p>
            <a href="tel:8008005893" class="btn btn-outline-gold w-100">
              <app-icon name="phone" [size]="16"></app-icon>
              <span>اتصل بنا: 800-800-LUXE</span>
            </a>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .site-header {
      position: sticky;
      top: 0;
      z-index: 90;
      background-color: rgba(250, 248, 245, 0.94);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--c-border);
      transition: all 0.3s ease;
    }

    .site-header.scrolled {
      background-color: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 82px;
    }

    /* Brand Logo */
    .brand-logo {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-decoration: none;

      .logo-sub {
        font-size: 0.62rem;
        letter-spacing: 0.28em;
        color: var(--c-gold-dark);
        font-weight: 600;
        text-transform: uppercase;
      }

      .logo-main {
        display: flex;
        align-items: center;
        gap: 0.45rem;
      }

      .logo-ar {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--c-dark);
        letter-spacing: -0.02em;
      }

      .logo-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--c-gold);
      }

      .logo-en {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--c-dark-secondary);
        letter-spacing: 0.08em;
      }
    }

    /* Desktop Navigation */
    .desktop-nav {
      display: flex;
      align-items: center;
    }

    .nav-list {
      display: flex;
      align-items: center;
      gap: 1.8rem;
      list-style: none;
    }

    .nav-link {
      font-size: 0.94rem;
      font-weight: 600;
      color: var(--c-dark-secondary);
      position: relative;
      padding: 0.5rem 0;
      transition: color 0.25s ease;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        height: 2px;
        background-color: var(--c-gold);
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      &:hover {
        color: var(--c-gold-hover);
        &::after {
          width: 100%;
        }
      }

      &.active {
        color: var(--c-dark);
        font-weight: 700;
        &::after {
          width: 100%;
          background-color: var(--c-dark);
        }
      }
    }

    /* Header Actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .action-btn {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      color: var(--c-dark);
      transition: all 0.25s ease;

      &:hover {
        border-color: var(--c-gold);
        color: var(--c-gold-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(197, 168, 128, 0.2);
      }
    }

    .action-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: var(--c-dark);
      color: #FFFFFF;
      font-size: 0.68rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
    }

    .mobile-toggle-btn {
      display: none;
      color: var(--c-dark);
      padding: 0.4rem;
    }

    /* Mobile Drawer */
    .mobile-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
    }

    .mobile-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 82%;
      max-width: 360px;
      background: #FFFFFF;
      z-index: 101;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-drawer);
      overflow-y: auto;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--c-border-light);

      .drawer-title {
        display: flex;
        flex-direction: column;
        .logo-ar {
          font-weight: 800;
          font-size: 1.2rem;
        }
        .logo-sub {
          font-size: 0.75rem;
          color: var(--c-gold);
        }
      }
    }

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      padding: 1rem 0;
      flex: 1;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.9rem 1.5rem;
      font-size: 0.98rem;
      font-weight: 600;
      color: var(--c-dark);
      border-bottom: 1px solid var(--c-border-light);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--c-gold-light);
        color: var(--c-gold-dark);
      }
    }

    .drawer-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--c-border-light);
      background-color: var(--c-surface-soft);

      .service-text {
        font-size: 0.8rem;
        color: var(--c-muted);
        text-align: center;
        margin-bottom: 0.75rem;
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .w-100 {
      width: 100%;
    }

    @media (max-width: 992px) {
      .desktop-nav {
        display: none;
      }
      .mobile-toggle-btn {
        display: block;
      }
      .header-container {
        height: 70px;
      }
      .brand-logo .logo-ar {
        font-size: 1.15rem;
      }
      .brand-logo .logo-en {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  searchService = inject(SearchModalService);

  mobileMenuOpen = signal<boolean>(false);
  isScrolled = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 20);
      }, { passive: true });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  openSearch(): void {
    this.searchService.open();
  }

  openCart(): void {
    this.cartService.openDrawer();
  }
}

