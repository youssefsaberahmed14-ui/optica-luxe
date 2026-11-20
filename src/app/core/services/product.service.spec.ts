import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

const UUID_1 = 'c0000000-0000-4000-8000-000000000001';
const UUID_2 = 'c0000000-0000-4000-8000-000000000002';
const UUID_3 = 'c0000000-0000-4000-8000-000000000003';

const MOCK_PRODUCTS_DATA: Product[] = [
  {
    id: UUID_1,
    name: 'Cartier Santos-Dumont Gold Edition',
    nameAr: 'كارتييه سانتوس دومون مطلية بالذهب',
    brand: 'Cartier',
    brandAr: 'كارتييه',
    category: 'sunglasses',
    categoryAr: 'نظارات شمسية',
    price: 3200,
    oldPrice: 3800,
    discountPercent: 15,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 38,
    images: ['https://example.com/c1.jpg'],
    thumbnail: 'https://example.com/c1.jpg',
    colors: [{ name: 'Gold', nameAr: 'ذهب', code: '#D4AF37' }],
    shape: 'aviator',
    shapeAr: 'أفياتور',
    material: 'gold-plated',
    materialAr: 'معدن مطلي بالذهب',
    gender: 'unisex',
    genderAr: 'للجنسين',
    dimensions: { lensWidth: 58, bridgeWidth: 16, templeLength: 140 },
    descriptionAr: 'وصف كارتييه',
    storyAr: 'قصة كارتييه',
    featuresAr: ['ميزة 1'],
    inStock: true,
    sku: 'CRT-001',
  },
  {
    id: UUID_2,
    name: 'Tom Ford Snowdon Classic Acetate',
    nameAr: 'توم فورد سنودون كلاسيك أسيتات',
    brand: 'Tom Ford',
    brandAr: 'توم فورد',
    category: 'sunglasses',
    categoryAr: 'نظارات شمسية',
    price: 1950,
    oldPrice: 2200,
    discountPercent: 10,
    isNew: true,
    isBestSeller: true,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 94,
    images: ['https://example.com/tf1.jpg'],
    thumbnail: 'https://example.com/tf1.jpg',
    colors: [{ name: 'Black', nameAr: 'أسود', code: '#000000' }],
    shape: 'square',
    shapeAr: 'مربع',
    material: 'acetate',
    materialAr: 'أسيتات',
    gender: 'men',
    genderAr: 'رجالي',
    dimensions: { lensWidth: 52, bridgeWidth: 20, templeLength: 145 },
    descriptionAr: 'وصف توم فورد',
    storyAr: 'قصة توم فورد',
    featuresAr: ['ميزة 2'],
    inStock: true,
    sku: 'TF-002',
  },
  {
    id: UUID_3,
    name: 'Lindberg Air Rim Titanium Medical',
    nameAr: 'ليندبيرغ إير ريم تيتانيوم طبي',
    brand: 'Lindberg',
    brandAr: 'ليندبيرغ',
    category: 'eyeglasses',
    categoryAr: 'نظارات طبية',
    price: 2800,
    oldPrice: undefined,
    discountPercent: 0,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 22,
    images: ['https://example.com/lb1.jpg'],
    thumbnail: 'https://example.com/lb1.jpg',
    colors: [{ name: 'Silver', nameAr: 'فضي', code: '#E5E4E2' }],
    shape: 'round',
    shapeAr: 'دائري',
    material: 'titanium',
    materialAr: 'تيتانيوم',
    gender: 'unisex',
    genderAr: 'للجنسين',
    dimensions: { lensWidth: 48, bridgeWidth: 21, templeLength: 135 },
    descriptionAr: 'وصف ليندبيرغ',
    storyAr: 'قصة ليندبيرغ',
    featuresAr: ['ميزة 3'],
    inStock: false,
    sku: 'LND-003',
  },
];

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProductService],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ProductService);

    // Handle initial auto-load request in constructor
    const req = httpTesting.match(`${environment.apiUrl}/products`);
    if (req.length > 0) {
      req[0].flush({
        success: true,
        count: MOCK_PRODUCTS_DATA.length,
        data: MOCK_PRODUCTS_DATA,
      });
    } else {
      service.setMockProducts(MOCK_PRODUCTS_DATA);
    }
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created and have database-backed products loaded via API', () => {
    expect(service).toBeTruthy();
    expect(service.products().length).toBe(3);
    expect(service.error()).toBeNull();
  });

  it('should find product by real database UUID', () => {
    const product = service.getProductById(UUID_1);
    expect(product).toBeDefined();
    expect(product?.id).toBe(UUID_1);
    expect(product?.brand).toBe('Cartier');
  });

  it('should filter products by category', () => {
    const sunglasses = service.filterProducts({ category: 'sunglasses' });
    expect(sunglasses.length).toBe(2);
    expect(sunglasses.every((p) => p.category === 'sunglasses')).toBe(true);

    const eyeglasses = service.filterProducts({ category: 'eyeglasses' });
    expect(eyeglasses.length).toBe(1);
    expect(eyeglasses[0].brand).toBe('Lindberg');
  });

  it('should filter products by search query in Arabic and English', () => {
    const searchAr = service.filterProducts({ searchQuery: 'كارتييه' });
    expect(searchAr.length).toBe(1);
    expect(searchAr[0].nameAr).toContain('كارتييه');

    const searchEn = service.filterProducts({ searchQuery: 'Tom Ford' });
    expect(searchEn.length).toBe(1);
    expect(searchEn[0].brand).toBe('Tom Ford');
  });

  it('should filter products by price, material, and stock status', () => {
    const under2500 = service.filterProducts({ maxPrice: 2500 });
    expect(under2500.length).toBe(1);
    expect(under2500[0].price).toBe(1950);

    const titanium = service.filterProducts({ material: 'titanium' });
    expect(titanium.length).toBe(1);
    expect(titanium[0].material).toBe('titanium');
  });

  it('should sort products by price ascending and rating', () => {
    const sortedPrice = service.filterProducts({ sortBy: 'price-asc' });
    expect(sortedPrice[0].price).toBe(1950);
    expect(sortedPrice[1].price).toBe(2800);
    expect(sortedPrice[2].price).toBe(3200);

    const sortedRating = service.filterProducts({ sortBy: 'rating' });
    expect(sortedRating[0].rating).toBe(4.9);
  });

  it('should get related products excluding the current product UUID', () => {
    const related = service.getRelatedProducts(UUID_1, 4);
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.id !== UUID_1)).toBe(true);
  });

  it('should handle API failure gracefully by setting error signal and not using fake products', () => {
    service.loadProducts().subscribe({
      error: () => {},
    });

    const failedReq = httpTesting.expectOne(`${environment.apiUrl}/products`);
    failedReq.flush(
      { success: false, message: 'Server database connection timeout' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(service.error()).toBeTruthy();
    expect(service.isLoading()).toBe(false);
  });
});
