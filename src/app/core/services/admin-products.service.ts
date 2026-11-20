import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductDto {
  id?: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  oldPrice?: number | null;
  discountPercent?: number | null;
  image: string;
  images?: string[];
  category: string;
  categoryAr?: string;
  brand: string;
  brandAr?: string;
  stock: number;
  shape?: string;
  shapeAr?: string;
  material?: string;
  materialAr?: string;
  gender?: string;
  genderAr?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  sku: string;
  colors?: any;
  dimensions?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  data: ProductDto[];
}

export interface SingleProductResponse {
  success: boolean;
  message?: string;
  data: ProductDto;
}

@Injectable({
  providedIn: 'root',
})
export class AdminProductsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/products`;

  getAll(filters?: { category?: string; brand?: string; search?: string }): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (filters?.category && filters.category !== 'all') params = params.set('category', filters.category);
    if (filters?.brand && filters.brand !== 'all') params = params.set('brand', filters.brand);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<ProductsResponse>(this.url, { params });
  }

  getById(id: string): Observable<SingleProductResponse> {
    return this.http.get<SingleProductResponse>(`${this.url}/${id}`);
  }

  create(product: ProductDto): Observable<SingleProductResponse> {
    return this.http.post<SingleProductResponse>(this.url, product);
  }

  update(id: string, product: Partial<ProductDto>): Observable<SingleProductResponse> {
    return this.http.put<SingleProductResponse>(`${this.url}/${id}`, product);
  }

  delete(id: string): Observable<SingleProductResponse> {
    return this.http.delete<SingleProductResponse>(`${this.url}/${id}`);
  }

  updateStock(id: string, quantityChange: number): Observable<SingleProductResponse> {
    return this.http.patch<SingleProductResponse>(`${this.url}/${id}/stock`, { quantityChange });
  }
}
