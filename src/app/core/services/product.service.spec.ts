import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created and load initial products', () => {
    expect(service).toBeTruthy();
    expect(service.products().length).toBeGreaterThan(0);
  });

  it('should find product by ID', () => {
    const product = service.getProductById('opt-001');
    expect(product).toBeDefined();
    expect(product?.brand).toBe('Cartier');
  });

  it('should filter products by category', () => {
    const sunglasses = service.filterProducts({ category: 'sunglasses' });
    expect(sunglasses.length).toBeGreaterThan(0);
    expect(sunglasses.every((p) => p.category === 'sunglasses')).toBe(true);
  });

  it('should filter products by search query in Arabic and English', () => {
    const searchResult = service.filterProducts({ searchQuery: 'كارتييه' });
    expect(searchResult.length).toBeGreaterThan(0);
    expect(searchResult[0].nameAr).toContain('كارتييه');

    const searchEn = service.filterProducts({ searchQuery: 'Tom Ford' });
    expect(searchEn.length).toBeGreaterThan(0);
    expect(searchEn[0].brand).toBe('Tom Ford');
  });

  it('should sort products by price ascending', () => {
    const sorted = service.filterProducts({ sortBy: 'price-asc' });
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
    }
  });

  it('should get related products excluding the current product', () => {
    const related = service.getRelatedProducts('opt-001', 4);
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.id !== 'opt-001')).toBe(true);
  });
});

