import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CouponDto {
  id?: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isActive: boolean;
  expiryDate?: string | null;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponsResponse {
  success: boolean;
  count: number;
  data: CouponDto[];
}

export interface SingleCouponResponse {
  success: boolean;
  message?: string;
  data: CouponDto;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCouponsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/coupons`;

  getAll(): Observable<CouponsResponse> {
    return this.http.get<CouponsResponse>(this.url);
  }

  create(coupon: CouponDto): Observable<SingleCouponResponse> {
    return this.http.post<SingleCouponResponse>(this.url, coupon);
  }

  update(id: string, coupon: Partial<CouponDto>): Observable<SingleCouponResponse> {
    return this.http.put<SingleCouponResponse>(`${this.url}/${id}`, coupon);
  }

  toggleActive(id: string): Observable<SingleCouponResponse> {
    return this.http.patch<SingleCouponResponse>(`${this.url}/${id}/toggle`, {});
  }

  delete(id: string): Observable<SingleCouponResponse> {
    return this.http.delete<SingleCouponResponse>(`${this.url}/${id}`);
  }

  validate(code: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.url}/validate/${code}`);
  }
}
