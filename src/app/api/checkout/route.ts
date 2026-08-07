import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerInfo, cartItems } = body || {};

    if (!customerInfo || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'customerInfo and non-empty cartItems are required' },
        { status: 400 }
      );
    }

    // Gunakan Prisma Transaction agar aman dari bentrok (Race Condition)
    const newOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      // 1. Validasi Stok dan Harga ASLI dari Database
      for (const item of cartItems) {
        if (!item.variantId || !item.quantity || item.quantity <= 0) {
          throw new Error('Setiap item keranjang wajib memiliki variantId dan quantity valid.');
        }

        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`Varian produk dengan ID "${item.variantId}" tidak ditemukan.`);
        }

        const qty = parseInt(item.quantity, 10);
        if (variant.stock < qty) {
          throw new Error(
            `Stok ${variant.product?.productName || variant.variantName} tidak mencukupi. Sisa stok: ${variant.stock}`
          );
        }

        // Harga ASLI diambil dari database, BUKAN dari frontend!
        const itemSubtotal = variant.price * qty;
        subtotal += itemSubtotal;

        // Siapkan data item untuk disimpan
        orderItemsData.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product?.productName || 'Produk Bakery',
          variantName: variant.variantName,
          price: variant.price, // Harga asli DB!
          quantity: qty,
          subtotal: itemSubtotal,
        });

        // 2. Kunci (Booking) Stok sementara pesanan berstatus PENDING
        await tx.variant.update({
          where: { id: variant.id },
          data: { stock: { decrement: qty } },
        });
      }

      // Hitung Ongkir Statis RM 10.00
      const shippingFee = 10.0;
      const totalAmount = subtotal + shippingFee;

      // 3. Buat Pesanan di Database PostgreSQL
      const orderNumber = `FBS-${Date.now()}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerInfo.name || customerInfo.customerName || 'Pelanggan',
          customerEmail: customerInfo.email || customerInfo.customerEmail || 'customer@fbsbaker.store',
          customerPhone: customerInfo.phone || customerInfo.customerPhone || '',
          address: customerInfo.address || 'Alamat Utama',
          city: customerInfo.city || 'Chukai',
          state: customerInfo.state || 'Terengganu',
          postcode: customerInfo.postcode || '24000',
          notes: customerInfo.notes || '',
          subtotal,
          shippingFee,
          totalAmount,
          status: OrderStatus.Pending, // Status awal PENDING
          items: { create: orderItemsData },
          timelines: {
            create: {
              status: OrderStatus.Pending,
              title: 'Pesanan Dibuat',
              description: 'Pelanggan telah membuat pesanan dan stok inventaris telah dikunci.',
              updatedBy: 'System',
            },
          },
        },
        include: { items: true, timelines: true },
      });

      // Buat notifikasi internal
      await tx.notification.create({
        data: {
          title: `Pesanan Baru ${order.orderNumber}`,
          message: `Pesanan baru senilai RM ${order.totalAmount} telah diterima.`,
          type: 'ORDER_UPDATE',
        },
      }).catch(() => {});

      return order;
    });

    console.log('✅ [Checkout Transaction Success] Created order:', newOrder.orderNumber);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error('❌ [Checkout Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
