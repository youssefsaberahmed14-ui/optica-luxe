import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-item animate-fade-in" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <app-icon name="check" [size]="18"></app-icon> }
              @case ('warning') { <app-icon name="sparkles" [size]="18"></app-icon> }
              @case ('error') { <app-icon name="close" [size]="18"></app-icon> }
              @default { <app-icon name="award" [size]="18"></app-icon> }
            }
          </div>

          <div class="toast-body">
            @if (toast.title) {
              <strong class="toast-title">{{ toast.title }}</strong>
            }
            <span class="toast-text">{{ toast.message }}</span>
          </div>

          <button (click)="dismiss(toast.id)" class="toast-close-btn" aria-label="إغلاق التنبيه">
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 300;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: 380px;
      width: calc(100% - 48px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1.15rem;
      border-radius: var(--radius-sm);
      background: #141414;
      color: #FFFFFF;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      border-right: 4px solid var(--c-gold);
    }

    .toast-success {
      border-right-color: var(--c-gold);
      .toast-icon {
        color: var(--c-gold);
      }
    }

    .toast-error {
      border-right-color: var(--c-danger);
      .toast-icon {
        color: var(--c-danger);
      }
    }

    .toast-info {
      border-right-color: #3498DB;
      .toast-icon {
        color: #3498DB;
      }
    }

    .toast-body {
      display: flex;
      flex-direction: column;
      flex: 1;

      .toast-title {
        font-size: 0.82rem;
        font-weight: 700;
        margin-bottom: 0.15rem;
      }

      .toast-text {
        font-size: 0.82rem;
        color: #E0DDD8;
        line-height: 1.4;
      }
    }

    .toast-close-btn {
      color: #9E978F;
      font-size: 1.25rem;
      line-height: 1;
      padding: 0 0.25rem;

      &:hover {
        color: #FFFFFF;
      }
    }
  `]
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}

