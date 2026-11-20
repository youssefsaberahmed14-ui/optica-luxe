import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  totalOrders: number;
  newOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalDemoSales: number;
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface OrderTrendItem {
  date: string;
  count: number;
  sales: number;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: {
    metrics: DashboardMetrics;
    statusDistribution: StatusDistributionItem[];
    ordersTrend: OrderTrendItem[];
    recentOrders: RecentOrderItem[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/dashboard/overview`;

  getOverview(): Observable<DashboardOverviewResponse> {
    return this.http.get<DashboardOverviewResponse>(this.url);
  }
}
