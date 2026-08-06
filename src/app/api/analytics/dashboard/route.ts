import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const products = await prisma.product.findMany({
      include: { variants: true },
    });

    // Calculate BI Metrics
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      (p.variants || []).forEach(v => {
        totalInventoryValue += (v.stock || 0) * (v.price || 0);
        if (v.stock <= 0) outOfStockCount++;
        else if (v.stock < 10) lowStockCount++;
      });
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalSales,
        orderCount,
        averageOrderValue,
        totalInventoryValue,
        lowStockCount,
        outOfStockCount,
        productCount: products.length,
      },
      source: 'PRISMA_POSTGRES_BI_ENGINE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
