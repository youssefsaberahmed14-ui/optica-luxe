import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <div class="announcement-bar">
        <div class="container announcement-content">
          <div class="announcement-item">
            <app-icon name="sparkles" [size]="14" class="gold-icon"></app-icon>
            <span>عرض حصري: استخدم الكود <strong>LUXE2026</strong> للحصول على خصم 15% وتوصيل مجاني</span>
          </div>
          
          <div class="announcement-links">
            <span class="phone-link">
              <app-icon name="phone" [size]="13"></app-icon>
              <span>خدمة العملاء الفاخرة: 800-800-LUXE</span>
            </span>
            <button (click)="close()" class="close-btn" aria-label="إغلاق التنبيه">
              <app-icon name="close" [size]="14"></app-icon>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .announcement-bar {
      background-color: var(--c-dark);
      color: #FFFFFF;
      font-size: 0.82rem;
      padding: 0.55rem 0;
      border-bottom: 1px solid rgba(197, 168, 128, 0.25);
    }

    .announcement-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .announcement-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      letter-spacing: 0.02em;

      strong {
        color: var(--c-gold);
        font-weight: 700;
        letter-spacing: 0.05em;
        margin: 0 0.2rem;
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .announcement-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;

      .phone-link {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--c-muted-light);
        font-size: 0.8rem;
        direction: ltr;
      }
    }

    .close-btn {
      color: var(--c-muted-light);
      display: flex;
      align-items: center;
      transition: color 0.2s;

      &:hover {
        color: #FFFFFF;
      }
    }

    @media (max-width: 768px) {
      .announcement-content {
        justify-content: center;
      }
      .announcement-links {
        display: none;
      }
      .announcement-item {
        font-size: 0.75rem;
        text-align: center;
      }
    }
  `]
})
export class AnnouncementBarComponent {
  isVisible = signal<boolean>(true);

  close(): void {
    this.isVisible.set(false);
  }
}

