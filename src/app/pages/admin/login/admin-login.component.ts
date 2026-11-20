import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-login-page">
      <div class="login-card-wrapper animate-fade-in">
        <!-- Brand Header -->
        <div class="login-brand-header">
          <span class="brand-sub font-brand">HAUTE LUNETTERIE</span>
          <h1 class="brand-title">أوبتيكا لاكشري</h1>
          <div class="portal-badge">
            <app-icon name="award" [size]="14" class="gold-icon"></app-icon>
            <span>بوابة الإدارة المركزية • Admin Portal</span>
          </div>
        </div>

        <!-- Quick Demo Fill Banner -->
        <div class="demo-account-box">
          <div class="demo-box-content">
            <span class="demo-title">حساب المسؤول التجريبي:</span>
            <code class="demo-cred">admin&#64;optica-luxe.com / Admin&#64;123456</code>
          </div>
          <button type="button" (click)="fillDemoCredentials()" class="btn-fill-demo">
            تعبئة تلقائية
          </button>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">
            <app-icon name="close" [size]="16"></app-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Form -->
        <form (submit)="onSubmit($event)" class="login-form">
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني للإدارة</label>
            <div class="input-with-icon">
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                class="form-input"
                placeholder="admin@optica-luxe.com"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">كلمة المرور</label>
            <div class="input-with-icon">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                class="form-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="toggle-pass-btn"
                tabindex="-1"
              >
                <app-icon [name]="showPassword() ? 'eye' : 'eye'" [size]="16"></app-icon>
              </button>
            </div>
          </div>

          <button type="submit" [disabled]="loading()" class="btn btn-gold btn-lg w-100 mt-2">
            @if (loading()) {
              <span>جاري التحقق من الهوية...</span>
            } @else {
              <span>دخول لوحة التحكم</span>
              <app-icon name="arrow-left" [size]="18"></app-icon>
            }
          </button>

          <div class="back-to-store">
            <a routerLink="/">
              <app-icon name="arrow-right" [size]="14"></app-icon>
              <span>العودة إلى واجهة المتجر</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #121212 0%, #1F1D1A 100%);
      padding: 2rem 1.5rem;
      direction: rtl;
    }

    .login-card-wrapper {
      background: #FFFFFF;
      width: 100%;
      max-width: 460px;
      border-radius: var(--radius-md);
      padding: 3rem 2.5rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(197, 168, 128, 0.3);
    }

    .login-brand-header {
      text-align: center;
      margin-bottom: 2rem;

      .brand-sub {
        font-size: 0.72rem;
        color: var(--c-gold-dark);
        letter-spacing: 0.25em;
        text-transform: uppercase;
        display: block;
      }

      .brand-title {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--c-dark);
        margin: 0.2rem 0 0.6rem;
      }

      .portal-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--c-muted);
        background: var(--c-surface);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-full);
      }
    }

    .demo-account-box {
      background-color: var(--c-gold-light);
      border: 1px dashed var(--c-gold);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1.5rem;

      .demo-box-content {
        display: flex;
        flex-direction: column;

        .demo-title {
          font-size: 0.75rem;
          color: var(--c-gold-dark);
          font-weight: 700;
        }

        .demo-cred {
          font-size: 0.76rem;
          color: var(--c-dark);
          font-family: monospace;
          direction: ltr;
          text-align: right;
        }
      }

      .btn-fill-demo {
        background: var(--c-dark);
        color: #FFFFFF;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.35rem 0.65rem;
        border-radius: var(--radius-sm);
        white-space: nowrap;
        transition: background 0.2s;

        &:hover {
          background: var(--c-gold-hover);
        }
      }
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #FDEDEC;
      border: 1px solid #F5B7B1;
      color: #922B21;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .input-with-icon {
      position: relative;

      .toggle-pass-btn {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--c-muted-light);
        display: flex;
        align-items: center;

        &:hover {
          color: var(--c-dark);
        }
      }
    }

    .back-to-store {
      margin-top: 1.5rem;
      text-align: center;

      a {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--c-muted);

        &:hover {
          color: var(--c-gold-dark);
        }
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .w-100 {
      width: 100%;
    }

    .mt-2 {
      margin-top: 0.75rem;
    }
  `]
})
export class AdminLoginComponent {
  private authService = inject(AdminAuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  email = '';
  password = '';
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  fillDemoCredentials(): void {
    this.email = 'admin@optica-luxe.com';
    this.password = 'Admin@123456';
    this.errorMessage.set(null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.errorMessage.set('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notificationService.success(`مرحباً بك مجدداً، ${res.data.user.name}`);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
      },
    });
  }
}
