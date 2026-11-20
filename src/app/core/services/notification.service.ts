import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', title?: string, duration = 3500): void {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast: ToastMessage = { id, type, title, message, duration };

    this.toastsSignal.update((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title = 'تم بنجاح'): void {
    this.show(message, 'success', title);
  }

  info(message: string, title = 'تنبيه'): void {
    this.show(message, 'info', title);
  }

  warning(message: string, title = 'ملاحظة'): void {
    this.show(message, 'warning', title);
  }

  error(message: string, title = 'عذراً'): void {
    this.show(message, 'error', title);
  }

  dismiss(id: string): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}

