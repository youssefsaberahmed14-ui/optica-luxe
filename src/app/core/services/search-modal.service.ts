import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchModalService {
  private isOpenSignal = signal<boolean>(false);
  readonly isOpen = this.isOpenSignal.asReadonly();

  open(): void {
    this.isOpenSignal.set(true);
  }

  close(): void {
    this.isOpenSignal.set(false);
  }

  toggle(): void {
    this.isOpenSignal.update((open) => !open);
  }
}

