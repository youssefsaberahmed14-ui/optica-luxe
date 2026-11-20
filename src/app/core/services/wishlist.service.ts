import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';

const WISHLIST_STORAGE_KEY = 'optica_luxe_wishlist_v1';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistItemsSignal = signal<Product[]>(this.loadFromStorage());

  readonly items = this.wishlistItemsSignal.asReadonly();
  readonly count = computed(() => this.wishlistItemsSignal().length);

  constructor() {}

  isInWishlist(productId: string): boolean {
    return this.wishlistItemsSignal().some((item) => item.id === productId);
  }

  toggleWishlist(product: Product): boolean {
    const current = [...this.wishlistItemsSignal()];
    const index = current.findIndex((item) => item.id === product.id);

    let isAdded = false;
    if (index > -1) {
      current.splice(index, 1);
      isAdded = false;
    } else {
      current.push(product);
      isAdded = true;
    }

    this.wishlistItemsSignal.set(current);
    this.saveToStorage(current);
    return isAdded;
  }

  removeFromWishlist(productId: string): void {
    const current = this.wishlistItemsSignal().filter((p) => p.id !== productId);
    this.wishlistItemsSignal.set(current);
    this.saveToStorage(current);
  }

  clearWishlist(): void {
    this.wishlistItemsSignal.set([]);
    this.saveToStorage([]);
  }

  private loadFromStorage(): Product[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Could not load wishlist from localStorage', e);
    }
    return [];
  }

  private saveToStorage(items: Product[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }
}

