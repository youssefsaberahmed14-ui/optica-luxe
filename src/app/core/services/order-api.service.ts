import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  selectedColor?: string;
  lensOption?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  items: OrderItemPayload[];
  couponCode?: string | null;
  paymentMethod?: string;
  notes?: string | null;
}

export interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  total: number;
  selectedColor?: string;
  lensOption?: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemData[];
}

export interface OrdersListResponse {
  success: boolean;
  count: number;
  data: OrderData[];
}

export interface SingleOrderResponse {
  success: boolean;
  message?: string;
  data: OrderData;
}

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  createOrder(payload: CreateOrderPayload): Observable<SingleOrderResponse> {
    return this.http.post<SingleOrderResponse>(this.baseUrl, payload);
  }

  getOrderById(idOrNumber: string): Observable<SingleOrderResponse> {
    return this.http.get<SingleOrderResponse>(`${this.baseUrl}/${idOrNumber}`);
  }

  getAllOrders(filters?: {
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
  }): Observable<OrdersListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.orderStatus && filters.orderStatus !== 'all') params = params.set('orderStatus', filters.orderStatus);
      if (filters.paymentStatus && filters.paymentStatus !== 'all') params = params.set('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    }
    return this.http.get<OrdersListResponse>(this.baseUrl, { params });
  }

  updateOrderStatus(
    orderId: string,
    update: { orderStatus: string; paymentStatus?: string; notes?: string }
  ): Observable<SingleOrderResponse> {
    return this.http.patch<SingleOrderResponse>(`${this.baseUrl}/${orderId}/status`, update);
  }
}
