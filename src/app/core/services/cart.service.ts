import { Injectable, computed, signal } from '@angular/core';
import { CartItem, CartSummary, LensOption, PrescriptionDetails } from '../models/cart.model';
import { Product, ProductColor } from '../models/product.model';

const STORAGE_KEY = 'optica_luxe_cart_v1';
const COUPON_STORAGE_KEY = 'optica_luxe_coupon_v1';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.loadCartFromStorage());
  private isDrawerOpenSignal = signal<boolean>(false);
  private appliedCouponSignal = signal<string | null>(this.loadCouponFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly isDrawerOpen = this.isDrawerOpenSignal.asReadonly();
  readonly appliedCoupon = this.appliedCouponSignal.asReadonly();

  readonly totalItemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly summary = computed<CartSummary>(() => {
    const items = this.itemsSignal();
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    let couponDiscountPercent = 0;
    const coupon = this.appliedCouponSignal();
    if (coupon) {
      const code = coupon.trim().toUpperCase();
      if (code === 'LUXE2026' || code === 'OPTICA15') {
        couponDiscountPercent = 15;
      } else if (code === 'VIP20') {
        couponDiscountPercent = 20;
      }
    }

    const discountAmount = Math.round((subtotal * couponDiscountPercent) / 100);
    const afterDiscount = subtotal - discountAmount;

    // Free shipping if afterDiscount >= 500 or items is empty
    const shipping = items.length === 0 || afterDiscount >= 500 ? 0 : 50;

    // 15% VAT included in price or breakdown
    const taxAmount = Math.round(afterDiscount * 0.15);
    const total = afterDiscount + shipping;

    return {
      subtotal,
      discountAmount,
      shipping,
      taxAmount,
      total,
      appliedCoupon: coupon || undefined,
      couponDiscountPercent,
    };
  });

  constructor() {}

  openDrawer(): void {
    this.isDrawerOpenSignal.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpenSignal.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpenSignal.update((open) => !open);
  }

  addToCart(
    product: Product,
    selectedColor?: ProductColor,
    quantity = 1,
    lensOption?: LensOption,
    customPrescription?: PrescriptionDetails
  ): void {
    const color = selectedColor || product.colors[0];
    const lens = lensOption;
    const itemId = `${product.id}_${color.code.replace('#', '')}_${lens ? lens.id : 'none'}`;

    const currentItems = [...this.itemsSignal()];
    const existingIndex = currentItems.findIndex((item) => item.id === itemId);

    const unitPrice = product.price + (lens ? lens.price : 0);

    if (existingIndex > -1) {
      const existing = currentItems[existingIndex];
      const newQty = existing.quantity + quantity;
      currentItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        total: newQty * unitPrice,
      };
    } else {
      currentItems.push({
        id: itemId,
        productId: product.id,
        product,
        quantity,
        selectedColor: color,
        lensOption: lens,
        customPrescription,
        price: unitPrice,
        total: quantity * unitPrice,
      });
    }

    this.itemsSignal.set(currentItems);
    this.saveCartToStorage(currentItems);
    this.openDrawer();
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const currentItems = this.itemsSignal().map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price,
        };
      }
      return item;
    });

    this.itemsSignal.set(currentItems);
    this.saveCartToStorage(currentItems);
  }

  removeItem(itemId: string): void {
    const currentItems = this.itemsSignal().filter((item) => item.id !== itemId);
    this.itemsSignal.set(currentItems);
    this.saveCartToStorage(currentItems);
  }

  clearCart(): void {
    this.itemsSignal.set([]);
    this.saveCartToStorage([]);
  }

  applyCoupon(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'LUXE2026' || cleanCode === 'OPTICA15') {
      this.appliedCouponSignal.set(cleanCode);
      this.saveCouponToStorage(cleanCode);
      return { success: true, message: 'تم تفعيل خصم 15% بنجاح على إجمالي الطلب!' };
    } else if (cleanCode === 'VIP20') {
      this.appliedCouponSignal.set(cleanCode);
      this.saveCouponToStorage(cleanCode);
      return { success: true, message: 'تم تطبيق كود كبار الشخصيات بنجاح (خصم 20%)!' };
    } else {
      return { success: false, message: 'كود الخصم غير صالح أو منتهي الصلاحية.' };
    }
  }

  removeCoupon(): void {
    this.appliedCouponSignal.set(null);
    this.saveCouponToStorage(null);
  }

  private loadCartFromStorage(): CartItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
    return [];
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }

  private loadCouponFromStorage(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  private saveCouponToStorage(coupon: string | null): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (coupon) {
          localStorage.setItem(COUPON_STORAGE_KEY, coupon);
        } else {
          localStorage.removeItem(COUPON_STORAGE_KEY);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

