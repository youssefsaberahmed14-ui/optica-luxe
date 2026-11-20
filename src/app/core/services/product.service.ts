import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FilterState, FrameDimensions, FrameMaterial, FrameShape, Gender, LensOption, Product, ProductCategory, ProductColor } from '../models/product.model';

export interface ProductsApiResponse {
  success: boolean;
  count: number;
  data: any[];
}

export interface SingleProductApiResponse {
  success: boolean;
  data: any;
}

function transformBackendProduct(dto: any): Product {
  const images =
    Array.isArray(dto.images) && dto.images.length > 0
      ? dto.images
      : dto.image
      ? [dto.image]
      : ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'];

  const colors: ProductColor[] =
    Array.isArray(dto.colors) && dto.colors.length > 0
      ? dto.colors
      : [{ name: 'Classic Gold', nameAr: 'ذهب كلاسيكي', code: '#D4AF37' }];

  const dimensions: FrameDimensions = dto.dimensions || {
    lensWidth: 54,
    bridgeWidth: 18,
    templeLength: 140,
  };

  const featuresAr: string[] =
    Array.isArray(dto.featuresAr) && dto.featuresAr.length > 0
      ? dto.featuresAr
      : [
          'حماية كاملة 100% من الأشعة فوق البنفسجية UV400',
          'هيكل فائق المتانة بتشطيب يدوي متقن',
          'علبة حفظ جلدية فاخرة وقطعة قماش ناعمة للتنظيف',
        ];

  return {
    id: dto.id,
    name: dto.name,
    nameAr: dto.nameAr || dto.name,
    brand: dto.brand,
    brandAr: dto.brandAr || dto.brand,
    category: (dto.category as ProductCategory) || 'sunglasses',
    categoryAr: dto.categoryAr || dto.category || 'نظارات شمسية',
    price: Number(dto.price),
    oldPrice: dto.oldPrice ? Number(dto.oldPrice) : undefined,
    discountPercent: dto.discountPercent ?? undefined,
    isNew: Boolean(dto.isNew),
    isBestSeller: Boolean(dto.isBestSeller),
    isFeatured: Boolean(dto.isFeatured),
    rating: typeof dto.rating === 'number' ? dto.rating : 4.9,
    reviewCount: typeof dto.reviewCount === 'number' ? dto.reviewCount : 15,
    thumbnail: dto.image || images[0],
    images,
    colors,
    shape: (dto.shape as FrameShape) || 'aviator',
    shapeAr: dto.shapeAr || 'أفياتور كلاسيكي',
    material: (dto.material as FrameMaterial) || 'titanium',
    materialAr: dto.materialAr || 'تيتانيوم',
    gender: (dto.gender as Gender) || 'unisex',
    genderAr: dto.genderAr || 'للجنسين',
    dimensions,
    descriptionAr: dto.descriptionAr || dto.description || '',
    storyAr: dto.storyAr || dto.descriptionAr || 'تحفة فنية مختارة بعناية من تشكيلة أوبتيكا لاكشري.',
    featuresAr,
    inStock: (dto.stock ?? 0) > 0,
    sku: dto.sku || dto.id,
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  private productsSignal = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Standard lens laboratory upgrade options
  readonly lensOptions: LensOption[] = [
    {
      id: 'lens-standard',
      name: 'Standard Clear UV400 Lenses (Included)',
      nameAr: 'عدسات حماية قياسية UV400 (مجانية مع الإطار)',
      price: 0,
      descriptionAr: 'عدسات شفافة عالية النقاء توفر حماية متكاملة من الأشعة فوق البنفسجية 100%.',
    },
    {
      id: 'lens-bluecut',
      name: 'Digital Blue-Block Shield',
      nameAr: 'عدسات بلو-كت لحماية العين من الشاشات الذكية',
      price: 350,
      descriptionAr: 'فلترة الضوء الأزرق الضار المنبعث من شاشات الهواتف والحواسيب لتقليل إجهاد العين والصداع.',
    },
    {
      id: 'lens-thin',
      name: 'Ultra-Thin Hi-Index 1.67 Anti-Reflective',
      nameAr: 'عدسات مضغوطة نحيفة جداً 1.67 فائقة الصفاء',
      price: 650,
      descriptionAr: 'عدسات خفيفة مضغوطة بنسبة 40%، مقاومة للانعكاسات، والخدوش، والتبخر والزيوت.',
    },
    {
      id: 'lens-photo',
      name: 'Transitions Signature Gen 8 (Photochromic)',
      nameAr: 'عدسات ترانزيشنز الذكية (تتحول لشمسية تلقائياً)',
      price: 850,
      descriptionAr: 'تتكيف بذكاء مع الإضاءة: شفافة تماماً في الأماكن المغلقة، وتتحول إلى شمسية داكنة تحت أشعة الشمس.',
    },
  ];

  // Expose signals
  readonly products = this.productsSignal.asReadonly();

  readonly bestSellers = computed(() =>
    this.productsSignal().filter((p) => p.isBestSeller)
  );

  readonly newArrivals = computed(() =>
    this.productsSignal().filter((p) => p.isNew)
  );

  readonly featuredProducts = computed(() =>
    this.productsSignal().filter((p) => p.isFeatured)
  );

  constructor() {
    this.loadProducts().subscribe({
      error: () => {
        // Error state handled in signal
      },
    });
  }

  /**
   * Fetches products from the authoritative backend API.
   * Updates state signals: products, isLoading, error.
   */
  loadProducts(filters?: { category?: string; brand?: string; search?: string }): Observable<Product[]> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (filters?.category && filters.category !== 'all') params = params.set('category', filters.category);
    if (filters?.brand && filters.brand !== 'all') params = params.set('brand', filters.brand);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<ProductsApiResponse>(this.apiUrl, { params }).pipe(
      map((res) => {
        const rawList = res.data || [];
        return rawList.map(transformBackendProduct);
      }),
      tap((prods) => {
        this.productsSignal.set(prods);
        this.error.set(null);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        const msg = err?.error?.message || 'فشل تحميل المنتجات من الخادم. يرجى مراجعة الاتصال.';
        this.error.set(msg);
        this.isLoading.set(false);
        return throwError(() => new Error(msg));
      })
    );
  }

  /**
   * Retrieves single product by database UUID from memory or fetches from backend.
   */
  loadProductById(id: string): Observable<Product | undefined> {
    const existing = this.productsSignal().find((p) => p.id === id);
    if (existing) {
      return of(existing);
    }

    return this.http.get<SingleProductApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((res) => {
        if (!res.data) return undefined;
        const prod = transformBackendProduct(res.data);
        this.productsSignal.update((list) => {
          if (!list.some((p) => p.id === prod.id)) {
            return [...list, prod];
          }
          return list;
        });
        return prod;
      }),
      catchError(() => of(undefined))
    );
  }

  /**
   * Refreshes the catalog from the backend API.
   * Useful when products are created, updated, or deleted via the admin dashboard.
   */
  refresh(): void {
    this.loadProducts().subscribe({
      error: () => {},
    });
  }

  /**
   * Synchronous lookup in current memory cache.
   */
  getProductById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === id);
  }

  /**
   * Retrieves related products by matching category or brand, excluding current product.
   */
  getRelatedProducts(productId: string, limit = 4): Product[] {
    const current = this.getProductById(productId);
    if (!current) return this.productsSignal().slice(0, limit);

    const matches = this.productsSignal().filter(
      (p) => p.id !== productId && (p.category === current.category || p.brand === current.brand)
    );

    if (matches.length >= limit) {
      return matches.slice(0, limit);
    }

    const others = this.productsSignal().filter(
      (p) => p.id !== productId && !matches.some((m) => m.id === p.id)
    );

    return [...matches, ...others].slice(0, limit);
  }

  /**
   * Authoritative client-side filtering and sorting on live loaded products.
   * Supports bilingual Arabic and English searching across name, brand, category, shape, etc.
   */
  filterProducts(filters: FilterState): Product[] {
    let result = [...this.productsSignal()];

    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.brand && filters.brand !== 'all') {
      result = result.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
    }

    if (filters.shape && filters.shape !== 'all') {
      result = result.filter((p) => p.shape === filters.shape);
    }

    if (filters.material && filters.material !== 'all') {
      result = result.filter((p) => p.material === filters.material);
    }

    if (filters.gender && filters.gender !== 'all') {
      result = result.filter((p) => p.gender === filters.gender || p.gender === 'unisex');
    }

    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.onlyDiscounted) {
      result = result.filter((p) => (p.discountPercent || 0) > 0);
    }

    if (filters.onlyNew) {
      result = result.filter((p) => p.isNew);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.brandAr.includes(q) ||
          p.categoryAr.includes(q) ||
          p.shapeAr.includes(q)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }

  /**
   * Aggregates available brands dynamically from the loaded database products.
   */
  getAllBrands(): { name: string; nameAr: string; count: number }[] {
    const counts = new Map<string, { name: string; nameAr: string; count: number }>();
    for (const p of this.productsSignal()) {
      const existing = counts.get(p.brand);
      if (existing) {
        existing.count++;
      } else {
        counts.set(p.brand, { name: p.brand, nameAr: p.brandAr, count: 1 });
      }
    }
    return Array.from(counts.values());
  }

  /**
   * Helper method for testing: allows seeding products directly in unit tests without HTTP.
   */
  setMockProducts(products: Product[]): void {
    this.productsSignal.set(products);
    this.error.set(null);
  }
}
