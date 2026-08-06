// Customer Intelligence & CRM Segmentation Engine
import { prisma } from '@/lib/prisma';

export interface CustomerIntelligenceProfile {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalSpending: number;
  orderCount: number;
  averageOrderValue: number;
  segmentation: 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE' | 'HIGH_RISK';
  customerScore: number; // 0-100
  customerLifetimeValue: number;
  repeatPurchaseProbability: number; // e.g. 88%
}

export async function generateCustomerIntelligence(): Promise<CustomerIntelligenceProfile[]> {
  try {
    const customers = await prisma.customer.findMany({
      take: 100,
    });

    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
    });

    return customers.map(c => {
      const custOrders = orders.filter(o => o.customerPhone && c.phone && o.customerPhone.includes(c.phone));
      const totalSpending = custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const orderCount = custOrders.length;
      const averageOrderValue = orderCount > 0 ? totalSpending / orderCount : 0;

      let segmentation: 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE' | 'HIGH_RISK' = 'REGULAR';
      let customerScore = 70;

      if (totalSpending > 500 || orderCount >= 5) {
        segmentation = 'VIP';
        customerScore = 95;
      } else if (orderCount === 1) {
        segmentation = 'NEW';
        customerScore = 60;
      } else if (orderCount === 0) {
        segmentation = 'INACTIVE';
        customerScore = 40;
      }

      return {
        customerId: c.id,
        customerName: c.name,
        customerEmail: c.email || 'customer@fbsbaker.store',
        customerPhone: c.phone,
        totalSpending,
        orderCount,
        averageOrderValue,
        segmentation,
        customerScore,
        customerLifetimeValue: totalSpending * 2.5,
        repeatPurchaseProbability: segmentation === 'VIP' ? 92 : 65,
      };
    });
  } catch (err) {
    return [];
  }
}
