import { env } from '../config/env';
import { isPostgresConnected, isolatedTestDb, prisma } from '../database/prisma';

export class DashboardService {
  async getOverview() {
    if (env.isProduction && !isPostgresConnected) {
      throw { statusCode: 503, message: 'خدمة لوحة المؤشرات غير متاحة حالياً لعدم توفر قاعدة البيانات.' };
    }

    let orders: any[] = [];
    let products: any[] = [];

    if (isPostgresConnected) {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      products = await prisma.product.findMany();
    } else {
      orders = isolatedTestDb.orders;
      products = isolatedTestDb.products;
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus?.toUpperCase() === 'PENDING').length;
    const confirmedOrders = orders.filter((o) => o.orderStatus?.toUpperCase() === 'CONFIRMED').length;
    const processingOrders = orders.filter((o) => o.orderStatus?.toUpperCase() === 'PROCESSING').length;
    const shippedOrders = orders.filter((o) => o.orderStatus?.toUpperCase() === 'SHIPPED').length;
    const completedOrders = orders.filter((o) => o.orderStatus?.toUpperCase() === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus?.toUpperCase() === 'CANCELLED').length;

    // Total sales (excluding cancelled orders)
    const validOrders = orders.filter((o) => o.orderStatus?.toUpperCase() !== 'CANCELLED');
    const totalSales = Math.round(validOrders.reduce((sum, o) => sum + (o.total || 0), 0));

    // Products statistics
    const totalProducts = products.length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0).length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

    // Status distribution
    const statusDistribution = [
      { status: 'PENDING', label: 'قيد الانتظار', count: pendingOrders, color: '#F59E0B' },
      { status: 'CONFIRMED', label: 'مؤكد', count: confirmedOrders, color: '#3B82F6' },
      { status: 'PROCESSING', label: 'قيد التجهيز', count: processingOrders, color: '#8B5CF6' },
      { status: 'SHIPPED', label: 'تم الشحن', count: shippedOrders, color: '#06B6D4' },
      { status: 'DELIVERED', label: 'تم التسليم', count: completedOrders, color: '#10B981' },
      { status: 'CANCELLED', label: 'ملغي', count: cancelledOrders, color: '#EF4444' },
    ];

    // Orders over time (group by last 7 days)
    const last7Days: Record<string, { date: string; count: number; sales: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      last7Days[dateKey] = { date: dateKey, count: 0, sales: 0 };
    }

    orders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
      if (last7Days[dateKey]) {
        last7Days[dateKey].count++;
        if (o.orderStatus?.toUpperCase() !== 'CANCELLED') {
          last7Days[dateKey].sales += o.total || 0;
        }
      }
    });

    const ordersOverTime = Object.values(last7Days);

    return {
      metrics: {
        totalOrders,
        newOrders: pendingOrders,
        completedOrders,
        cancelledOrders,
        totalDemoSales: totalSales,
        totalProducts,
        outOfStockProducts,
        lowStockProducts,
      },
      statusDistribution,
      ordersOverTime,
      recentOrders: orders.slice(0, 5).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        phone: o.phone,
        total: o.total,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
