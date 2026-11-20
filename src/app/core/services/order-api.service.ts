import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  paymentMethod?: 'COD';
  notes?: string | null;
  idempotencyKey: string; // Mandatory stable key per checkout attempt
}

export interface OrderItemData {
  id?: string;
  orderId?: string;
  productId?: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  total: number;
  selectedColor?: string | null;
  lensOption?: string | null;
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
  paymentMethod: 'COD';
  paymentStatus: 'UNPAID' | 'PAID';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string | null;
  paidAt?: string | null;
  paidBy?: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  items: OrderItemData[];
}

export interface OrdersListResponse {
  success: boolean;
  count: number;
  data: OrderData[];
}

export interface CreatedOrderConfirmationData {
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: OrderItemData[];
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  data: CreatedOrderConfirmationData;
  trackingToken?: string;
}

export interface SingleOrderResponse {
  success: boolean;
  message?: string;
  alreadyPaid?: boolean;
  data: OrderData;
}

export interface TrackingDataResponse {
  success: boolean;
  data: {
    orderNumber: string;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    city: string;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    createdAt: string;
    estimatedDelivery: string;
    items: Array<{
      productName: string;
      productImage: string;
      unitPrice: number;
      quantity: number;
      total: number;
      selectedColor?: string;
      lensOption?: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  /**
   * Submits a new customer checkout order.
   * Sends idempotency key via standard HTTP header.
   */
  createOrder(payload: CreateOrderPayload): Observable<CreateOrderResponse> {
    let headers = new HttpHeaders();
    if (payload.idempotencyKey) {
      headers = headers.set('Idempotency-Key', payload.idempotencyKey);
    }
    return this.http.post<CreateOrderResponse>(this.baseUrl, payload, { headers });
  }

  /**
   * Securely queries order tracking information.
   * STRICTLY transmits tracking token via X-Tracking-Token header (no tokens in URL query params).
   */
  trackOrder(orderNumber: string, token: string): Observable<TrackingDataResponse> {
    const headers = new HttpHeaders().set('X-Tracking-Token', token.trim());
    return this.http.get<TrackingDataResponse>(
      `${this.baseUrl}/track/${encodeURIComponent(orderNumber.trim())}`,
      { headers }
    );
  }

  /**
   * Admin-Only: Retrieve complete order by ID or orderNumber.
   */
  getOrderById(idOrNumber: string): Observable<SingleOrderResponse> {
    return this.http.get<SingleOrderResponse>(`${this.baseUrl}/${encodeURIComponent(idOrNumber)}`);
  }

  /**
   * Admin-Only: Retrieve all orders with optional search and filters.
   */
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

  /**
   * Admin-Only: Updates order status and payment status.
   */
  updateOrderStatus(
    orderId: string,
    update: { orderStatus: string; paymentStatus?: string; notes?: string; cancellationReason?: string }
  ): Observable<SingleOrderResponse> {
    return this.http.patch<SingleOrderResponse>(`${this.baseUrl}/${orderId}/status`, update);
  }

  /**
   * Admin-Only: Dedicated Cash Collection Action for Cash on Delivery (COD) orders.
   * Transactional and idempotent.
   */
  collectCash(orderId: string): Observable<SingleOrderResponse> {
    return this.http.post<SingleOrderResponse>(`${this.baseUrl}/${orderId}/collect-cash`, {});
  }
}
