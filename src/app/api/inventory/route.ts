import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/inventory
// Query parameters: type (alerts | history | summary), productId, variantId, threshold, limit
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');
    const thresholdParam = parseInt(searchParams.get('threshold') || '10', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (type === 'history') {
      const whereCondition: any = { deletedAt: null };
      if (productId) whereCondition.productId = productId;
      if (variantId) whereCondition.variantId = variantId;

      const logs = await prisma.inventory.findMany({
        where: whereCondition,
        include: {
          product: { select: { id: true, productName: true, sku: true } },
          variant: { select: { id: true, variantName: true, sku: true, stock: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ success: true, logs, source: 'PRISMA_POSTGRES' });
    }

    if (type === 'alerts') {
      const variants = await prisma.variant.findMany({
        where: { deletedAt: null },
        include: {
          product: { select: { id: true, productName: true, sku: true, status: true } },
        },
      });

      const lowStockVariants = variants.filter(v => v.stock <= thresholdParam);
      const outOfStockVariants = variants.filter(v => v.stock === 0);

      return NextResponse.json({
        success: true,
        threshold: thresholdParam,
        summary: {
          totalVariants: variants.length,
          lowStockCount: lowStockVariants.length,
          outOfStockCount: outOfStockVariants.length,
        },
        lowStockVariants,
        outOfStockVariants,
        source: 'PRISMA_POSTGRES',
      });
    }

    // Default summary view
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        variants: { where: { deletedAt: null } },
      },
      orderBy: { productName: 'asc' },
    });

    const inventorySummary = products.map(p => {
      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      let status = 'IN_STOCK';
      if (totalStock === 0) status = 'OUT_OF_STOCK';
      else if (totalStock <= thresholdParam) status = 'LOW_STOCK';

      return {
        productId: p.id,
        productName: p.productName,
        sku: p.sku,
        totalStock,
        status,
        variants: p.variants.map(v => ({
          variantId: v.id,
          variantName: v.variantName,
          sku: v.sku,
          stock: v.stock,
          price: v.price,
        })),
      };
    });

    return NextResponse.json({ success: true, inventory: inventorySummary, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Inventory GET Error]:', err);
    return NextResponse.json({ success: false, error: `Database Error: ${err.message}` }, { status: 500 });
  }
}

// POST /api/inventory
// Body: { variantId, changeType ('RESTOCK' | 'ADJUST' | 'MANUAL_DEDUCTION' | 'CANCEL_RESTORE'), quantityChange, notes, orderNumber }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { variantId, changeType, quantityChange, notes, orderNumber } = body || {};

    // Input Validation
    if (!variantId || !changeType || quantityChange === undefined || isNaN(parseInt(quantityChange, 10))) {
      return NextResponse.json(
        { success: false, error: 'variantId, changeType, and valid integer quantityChange are required' },
        { status: 400 }
      );
    }

    const parsedQty = parseInt(quantityChange, 10);
    const validChangeTypes = ['RESTOCK', 'ADJUST', 'MANUAL_DEDUCTION', 'CANCEL_RESTORE', 'SALE_DEDUCTION'];

    if (!validChangeTypes.includes(changeType)) {
      return NextResponse.json(
        { success: false, error: `Invalid changeType. Must be one of: ${validChangeTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Atomic Prisma Transaction (Rollback on negative stock or missing variant)
    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant || variant.deletedAt !== null) {
        throw new Error(`Variant with ID "${variantId}" not found or deleted`);
      }

      let newStock = variant.stock;

      if (changeType === 'RESTOCK' || changeType === 'CANCEL_RESTORE') {
        if (parsedQty <= 0) throw new Error('Quantity change for RESTOCK must be greater than 0');
        newStock += parsedQty;
      } else if (changeType === 'MANUAL_DEDUCTION' || changeType === 'SALE_DEDUCTION') {
        if (parsedQty <= 0) throw new Error('Quantity change for DEDUCTION must be greater than 0');
        if (variant.stock < parsedQty) {
          throw new Error(`Insufficient stock. Current stock is ${variant.stock}, cannot deduct ${parsedQty}`);
        }
        newStock -= parsedQty;
      } else if (changeType === 'ADJUST') {
        if (parsedQty < 0) throw new Error('New stock value for ADJUST cannot be negative');
        newStock = parsedQty;
      }

      if (newStock < 0) {
        throw new Error('Stock cannot be reduced below 0');
      }

      // 1. Update Variant Stock
      const updatedVariant = await tx.variant.update({
        where: { id: variantId },
        data: {
          stock: newStock,
          updatedAt: new Date(),
        },
      });

      // 2. Record Inventory Log Entry
      const inventoryLog = await tx.inventory.create({
        data: {
          id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: variant.productId,
          variantId: variant.id,
          changeType,
          quantityChange: parsedQty,
          stockAfter: newStock,
          orderNumber: orderNumber || null,
          notes: notes || `Stock updated via ${changeType}`,
        },
      });

      return { updatedVariant, inventoryLog };
    });

    console.log('✅ [Prisma Inventory Updated]:', result.updatedVariant.sku, 'New Stock:', result.updatedVariant.stock);
    return NextResponse.json({
      success: true,
      variant: result.updatedVariant,
      log: result.inventoryLog,
      source: 'PRISMA_POSTGRES',
    });
  } catch (err: any) {
    console.error('[Prisma Inventory POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
