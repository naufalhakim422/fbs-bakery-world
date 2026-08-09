import React from 'react';
import { prisma } from '@/lib/prisma';
import { OrderTableInteractive, SerializedOrder } from '@/components/admin/order-actions';
import { normalizeToFrontendStatus } from '@/types';

export const revalidate = 0; // Disable caching so data is rendered fresh on every server request

export default async function AdminOrdersPage() {
  let serializedOrders: SerializedOrder[] = [];

  try {
    const prismaOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        items: true,
        tracking: true,
        timelines: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    serializedOrders = prismaOrders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      address: o.address,
      city: o.city,
      state: o.state,
      totalAmount: o.totalAmount,
      orderStatus: normalizeToFrontendStatus(o.status),
      courierName: o.tracking?.courierName || null,
      trackingNumber: o.tracking?.trackingNumber || null,
      items: o.items.map(i => ({
        id: i.id,
        productName: i.productName,
        variantName: i.variantName,
        mainImage: i.mainImage,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.subtotal,
      })),
      createdAt: o.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('[Server Component Error] Failed to fetch orders from database:', err);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Manajemen Pesanan</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Mengelola pesanan pelanggan melalui WhatsApp, memverifikasi pembayaran, dan menerbitkan nomor tanda terima pengiriman.
          </p>
        </div>
      </div>

      {/* Interactive Server-Rendered Order Table */}
      <OrderTableInteractive initialOrders={serializedOrders} adminBase="/admin" />
    </div>
  );
}
