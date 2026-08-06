// Predictive Inventory Shortage & Purchase Order Recommendation Engine
import { prisma } from '@/lib/prisma';

export interface InventoryShortageWarning {
  productId: string;
  productName: string;
  variantName: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilOutOfStock: number;
  recommendedPurchaseQty: number;
  recommendedPurchaseDate: string;
  recommendedSupplier: string;
  expectedArrivalDate: string;
}

export async function analyzeInventoryShortages(): Promise<InventoryShortageWarning[]> {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
    });

    const warnings: InventoryShortageWarning[] = [];

    products.forEach(p => {
      (p.variants || []).forEach(v => {
        if (v.stock < 15) {
          const avgDailySales = Math.max(1, Math.round((p.totalSold || 10) / 30));
          const daysLeft = Math.max(0, Math.floor(v.stock / avgDailySales));
          
          const purchDate = new Date();
          purchDate.setDate(purchDate.getDate() + Math.max(1, daysLeft - 2));

          const arrivalDate = new Date(purchDate);
          arrivalDate.setDate(arrivalDate.getDate() + 3); // 3-day lead time

          warnings.push({
            productId: p.id,
            productName: p.productName,
            variantName: v.variantName,
            currentStock: v.stock,
            avgDailySales,
            daysUntilOutOfStock: daysLeft,
            recommendedPurchaseQty: 50,
            recommendedPurchaseDate: purchDate.toISOString().split('T')[0],
            recommendedSupplier: 'Nusantara Ingredients Supply Sdn Bhd',
            expectedArrivalDate: arrivalDate.toISOString().split('T')[0],
          });
        }
      });
    });

    return warnings;
  } catch (err) {
    return [];
  }
}
