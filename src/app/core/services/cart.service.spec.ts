import { TestBed } from '@angular/core/testing';
import { Product } from '../models/product.model';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 'test-1',
    name: 'Test Eyewear',
    nameAr: 'نظارة اختبار',
    brand: 'TestBrand',
    brandAr: 'ماركة اختبار',
    category: 'sunglasses',
    categoryAr: 'نظارات شمسية',
    price: 1000,
    rating: 5,
    reviewCount: 10,
    images: ['https://example.com/img.jpg'],
    thumbnail: 'https://example.com/thumb.jpg',
    colors: [{ name: 'Gold', nameAr: 'ذهبي', code: '#D4AF37' }],
    shape: 'aviator',
    shapeAr: 'أفياتور',
    material: 'titanium',
    materialAr: 'تيتانيوم',
    gender: 'unisex',
    genderAr: 'للجنسين',
    dimensions: { lensWidth: 50, bridgeWidth: 20, templeLength: 140 },
    descriptionAr: 'وصف',
    storyAr: 'قصة',
    featuresAr: ['ميزة 1'],
    inStock: true,
    sku: 'TEST-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(CartService);
    service.clearCart();
  });

  it('should initialize with an empty cart', () => {
    expect(service.items().length).toBe(0);
    expect(service.totalItemCount()).toBe(0);
  });

  it('should add item to cart and calculate total', () => {
    service.addToCart(mockProduct, mockProduct.colors[0], 1);
    expect(service.items().length).toBe(1);
    expect(service.totalItemCount()).toBe(1);
    expect(service.summary().subtotal).toBe(1000);
  });

  it('should update quantity correctly', () => {
    service.addToCart(mockProduct, mockProduct.colors[0], 1);
    const itemId = service.items()[0].id;

    service.updateQuantity(itemId, 3);
    expect(service.totalItemCount()).toBe(3);
    expect(service.summary().subtotal).toBe(3000);

    service.updateQuantity(itemId, 0);
    expect(service.items().length).toBe(0);
  });

  it('should apply valid promo coupon and recalculate discount', () => {
    service.addToCart(mockProduct, mockProduct.colors[0], 1); // subtotal = 1000
    const res = service.applyCoupon('LUXE2026'); // 15% discount
    expect(res.success).toBe(true);
    expect(service.summary().discountAmount).toBe(150);
    expect(service.summary().total).toBe(850);
  });

  it('should reject invalid promo coupon', () => {
    const res = service.applyCoupon('INVALID_CODE');
    expect(res.success).toBe(false);
  });
});

