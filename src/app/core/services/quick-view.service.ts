import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class QuickViewService {
  private activeProductSignal = signal<Product | null>(null);
  readonly activeProduct = this.activeProductSignal.asReadonly();

  open(product: Product): void {
    this.activeProductSignal.set(product);
  }

  close(): void {
    this.activeProductSignal.set(null);
  }
}

