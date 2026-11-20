import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-shell">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar" [class.mobile-open]="mobileSidebarOpen()">
        <div class="sidebar-header">
          <div class="brand-box">
            <span class="sub font-brand">HAUTE LUNETTERIE</span>
            <span class="main">أوبتيكا لاكشري</span>
          </div>
          <span class="portal-tag">لوحة التحكم</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">القائمة الرئيسية</div>
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="active"
            (click)="closeMobileSidebar()"
            class="nav-item"
          >
            <app-icon name="award" [size]="18"></app-icon>
            <span>لوحة الإحصائيات العامة</span>
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="active"
            (click)="closeMobileSidebar()"
            class="nav-item"
          >
            <app-icon name="cart" [size]="18"></app-icon>
            <span>إدارة الطلبات والمبيعات</span>
          </a>

          <a
            routerLink="/admin/products"
            routerLinkActive="active"
            (click)="closeMobileSidebar()"
            class="nav-item"
          >
            <app-icon name="glasses" [size]="18"></app-icon>
            <span>المنتجات والمخزون</span>
          </a>

          <a
            routerLink="/admin/coupons"
            routerLinkActive="active"
            (click)="closeMobileSidebar()"
            class="nav-item"
          >
            <app-icon name="sparkles" [size]="18"></app-icon>
            <span>كوبونات الخصم والعروض</span>
          </a>

          <div class="nav-section-title mt-4">روابط سريعة</div>
          <a routerLink="/" target="_blank" class="nav-item external">
            <app-icon name="eye" [size]="18"></app-icon>
            <span>عرض واجهة المتجر</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-user-info">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ authService.currentUser()?.name || 'المدير' }}</span>
              <span class="user-role">{{ authService.currentUser()?.role || 'ADMIN' }}</span>
            </div>
          </div>

          <button (click)="logout()" class="logout-btn" title="تسجيل الخروج">
            <app-icon name="rotate-ccw" [size]="16"></app-icon>
            <span>خروج</span>
          </button>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="admin-main-wrap">
        <!-- Top Navbar -->
        <header class="admin-topbar">
          <button (click)="toggleMobileSidebar()" class="mobile-menu-btn" aria-label="القائمة">
            <app-icon name="menu" [size]="20"></app-icon>
          </button>

          <div class="topbar-status">
            <span class="live-dot"></span>
            <span class="status-text">خادم وقاعدة بيانات المتجر متصلة (تجريبي Demo)</span>
          </div>

          <div class="topbar-actions">
            <div class="demo-indicator-pill">
              <app-icon name="award" [size]="14"></app-icon>
              <span>Zentrix Demo E-Commerce</span>
            </div>
            <a routerLink="/" class="btn btn-outline btn-sm">
              <span>المتجر</span>
            </a>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main class="admin-page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background-color: #F8F6F2;
      direction: rtl;
    }

    /* Sidebar */
    .admin-sidebar {
      width: 270px;
      min-width: 270px;
      background-color: #141414;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 100;
    }

    .sidebar-header {
      padding: 1.75rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .brand-box {
        display: flex;
        flex-direction: column;

        .sub {
          font-size: 0.65rem;
          color: var(--c-gold);
          letter-spacing: 0.2em;
        }

        .main {
          font-size: 1.25rem;
          font-weight: 800;
        }
      }

      .portal-tag {
        font-size: 0.72rem;
        background: rgba(197, 168, 128, 0.15);
        color: var(--c-gold);
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(197, 168, 128, 0.3);
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      overflow-y: auto;

      .nav-section-title {
        font-size: 0.72rem;
        color: #7E7870;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0 0.75rem 0.4rem;
        font-weight: 700;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        font-weight: 600;
        color: #C0BAB2;
        transition: all 0.2s;

        &:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.06);
        }

        &.active {
          color: #121212;
          background: var(--c-gold);
          font-weight: 700;
        }

        &.external {
          color: var(--c-gold-dark);
          &:hover {
            color: var(--c-gold);
          }
        }
      }
    }

    .sidebar-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background-color: #0E0E0E;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .admin-user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--c-gold);
          color: #121212;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-meta {
          display: flex;
          flex-direction: column;

          .user-name {
            font-size: 0.85rem;
            font-weight: 700;
            color: #FFFFFF;
          }

          .user-role {
            font-size: 0.7rem;
            color: var(--c-gold);
          }
        }
      }

      .logout-btn {
        color: #A8A29A;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.78rem;
        padding: 0.4rem 0.6rem;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s;

        &:hover {
          color: var(--c-danger);
          border-color: var(--c-danger);
        }
      }
    }

    /* Main Area */
    .admin-main-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    .admin-topbar {
      height: 68px;
      background-color: #FFFFFF;
      border-bottom: 1px solid var(--c-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;

      .mobile-menu-btn {
        display: none;
        color: var(--c-dark);
      }

      .topbar-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
        }

        .status-text {
          color: var(--c-dark-secondary);
          font-weight: 600;
        }
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 1rem;

        .demo-indicator-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background-color: var(--c-gold-light);
          color: var(--c-gold-dark);
          border: 1px solid rgba(197, 168, 128, 0.4);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .btn-sm {
          padding: 0.4rem 0.9rem;
          font-size: 0.82rem;
        }
      }
    }

    .admin-page-content {
      padding: 2rem;
      flex: 1;
    }

    .mt-4 {
      margin-top: 1.5rem;
    }

    @media (max-width: 992px) {
      .admin-sidebar {
        position: fixed;
        right: -280px;
        transition: right 0.3s ease;

        &.mobile-open {
          right: 0;
        }
      }

      .admin-topbar .mobile-menu-btn {
        display: block;
      }
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AdminAuthService);
  mobileSidebarOpen = signal<boolean>(false);

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'OP';
    const parts = user.name.split(' ');
    if (parts.length > 1) return parts[0][0] + parts[1][0];
    return user.name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
