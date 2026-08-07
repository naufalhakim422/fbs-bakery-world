import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

declare global {
  var __fbs_orders_cache: any[] | undefined;
  var __fbs_deleted_orders_cache: string[] | undefined;
  var __fbs_status_overrides_cache: Record<string, any> | undefined;
}

const defaultInitialOrders = [
  {
    id: 'ord-1',
    orderNumber: '#FBS-20260805-101',
    customerId: 'cust-1',
    customerName: 'Muhammad Jaka',
    customerEmail: 'nopaldeso1@gmail.com',
    customerPhone: '+60123456789',
    address: 'No 45, Jalan Bunga Raya 7/2, Section 7',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    notes: 'Mohon kemas rapi dengan bubble wrap tebal',
    courierName: 'J&T Express',
    totalAmount: 145.00,
    orderStatus: 'CONFIRMED',
    trackingNumber: 'JT6829104829MY',
    shippedAt: '2026-08-05T14:30:00Z',
    createdAt: '2026-08-05T10:15:00Z',
    updatedAt: '2026-08-05T14:30:00Z',
    items: [
      {
        id: 'oi-1-1',
        orderId: 'ord-1',
        productId: 'prod-1',
        productVariantId: 'var-1-2',
        productName: 'Semolina Flour Premium Grade',
        variantName: '1kg',
        price: 15.00,
        quantity: 2,
        subtotal: 30.00,
        mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'oi-1-2',
        orderId: 'ord-1',
        productId: 'prod-3',
        productVariantId: 'var-3-2',
        productName: 'Belgian Dark Chocolate Chips 70%',
        variantName: '1kg Pack',
        price: 62.00,
        quantity: 1,
        subtotal: 62.00,
        mainImage: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
      }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: '#FBS-20260805-102',
    customerId: 'cust-2',
    customerName: 'Siti Nurhaliza',
    customerEmail: 'siti@example.com',
    customerPhone: '+60129876543',
    address: 'No 12, Jalan Bunga Raya, Section 7',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    notes: 'Pengiriman via Pos Laju',
    courierName: 'Pos Laju',
    totalAmount: 90.00,
    orderStatus: 'NEW',
    createdAt: '2026-08-05T16:20:00Z',
    updatedAt: '2026-08-05T16:20:00Z',
    items: [
      {
        id: 'oi-2-1',
        orderId: 'ord-2',
        productId: 'prod-2',
        productVariantId: 'var-2-2',
        productName: 'Uji Matcha Powder Grade A (Kyoto Import)',
        variantName: '250g Pack',
        price: 75.00,
        quantity: 1,
        subtotal: 75.00,
        mainImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      }
    ]
  },
  {
    id: 'ord-3',
    orderNumber: '#FBS-20260805-103',
    customerId: 'cust-3',
    customerName: 'Naufal Hakim Muzaki',
    customerEmail: 'nopalberak1@gmail.com',
    customerPhone: '0183942147',
    address: 'No 88, Jalan Universiti, Section 11',
    city: 'Petaling Jaya',
    state: 'Selangor',
    postcode: '46200',
    notes: 'Kirim saat jam kerja',
    courierName: 'J&T Express',
    totalAmount: 285.00,
    orderStatus: 'NEW',
    createdAt: '2026-08-05T17:45:00Z',
    updatedAt: '2026-08-05T17:45:00Z',
    items: [
      {
        id: 'oi-3-1',
        orderId: 'ord-3',
        productId: 'prod-1',
        productVariantId: 'var-1-2',
        productName: 'Semolina Flour Premium Grade',
        variantName: '1kg',
        price: 15.00,
        quantity: 1,
        subtotal: 15.00,
        mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'oi-3-2',
        orderId: 'ord-3',
        productId: 'prod-2',
        productVariantId: 'var-2-3',
        productName: 'Uji Matcha Powder Grade A (Kyoto Import)',
        variantName: '1kg Bakery Pack',
        price: 270.00,
        quantity: 1,
        subtotal: 270.00,
        mainImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      }
    ]
  }
];

function getDataFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_orders.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_orders.json');
  }
}

function getDeletedIdsFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_deleted_orders.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_deleted_orders.json');
  }
}

function readDeletedOrderIds(): string[] {
  if (globalThis.__fbs_deleted_orders_cache) {
    return globalThis.__fbs_deleted_orders_cache;
  }
  const file = getDeletedIdsFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalThis.__fbs_deleted_orders_cache = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  globalThis.__fbs_deleted_orders_cache = [];
  return [];
}

function writeDeletedOrderIds(deletedIds: string[]) {
  globalThis.__fbs_deleted_orders_cache = deletedIds;
  const file = getDeletedIdsFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(deletedIds, null, 2), 'utf-8');
  } catch (e) {}
}

function getOverridesFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_status_overrides.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_status_overrides.json');
  }
}

function readStatusOverrides(): Record<string, any> {
  if (globalThis.__fbs_status_overrides_cache) {
    return globalThis.__fbs_status_overrides_cache;
  }
  const file = getOverridesFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        globalThis.__fbs_status_overrides_cache = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  globalThis.__fbs_status_overrides_cache = {};
  return {};
}

function writeStatusOverride(orderId: string, orderNumber: string, statusData: any) {
  const overrides = readStatusOverrides();
  if (orderId) overrides[orderId] = statusData;
  if (orderNumber) overrides[orderNumber] = statusData;
  globalThis.__fbs_status_overrides_cache = overrides;
  const file = getOverridesFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(overrides, null, 2), 'utf-8');
  } catch (e) {}
}

function applyStatusOverrides(ordersList: any[]): any[] {
  const overrides = readStatusOverrides();
  return ordersList.map(o => {
    const ov = overrides[o.id] || overrides[o.orderNumber];
    if (ov) {
      return {
        ...o,
        orderStatus: ov.orderStatus || o.orderStatus,
        courierName: ov.courierName || o.courierName,
        trackingNumber: ov.trackingNumber !== undefined ? ov.trackingNumber : o.trackingNumber,
        updatedAt: ov.updatedAt || o.updatedAt,
      };
    }
    return o;
  });
}

function readServerOrders(): any[] {
  let baseOrders: any[] = [];
  if (globalThis.__fbs_orders_cache !== undefined && globalThis.__fbs_orders_cache.length > 0) {
    baseOrders = globalThis.__fbs_orders_cache;
  } else {
    const file = getDataFilePath();
    let loadedFromFile = false;
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseOrders = parsed;
          loadedFromFile = true;
        }
      }
    } catch (err) {
      console.error('Error reading orders file:', err);
    }

    if (!loadedFromFile) {
      baseOrders = defaultInitialOrders;
    }
    globalThis.__fbs_orders_cache = baseOrders;
  }

  const deletedIds = readDeletedOrderIds();
  const filtered = baseOrders.filter((o: any) => !deletedIds.includes(o.id) && !deletedIds.includes(o.orderNumber));
  return applyStatusOverrides(filtered);
}

function writeServerOrders(orders: any[]) {
  globalThis.__fbs_orders_cache = orders;
  const file = getDataFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    try {
      const tmpFile = path.join(os.tmpdir(), 'fbs_orders.json');
      fs.writeFileSync(tmpFile, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing tmp orders:', tmpErr);
    }
  }
}

const mapFrontendStatusToPrismaEnum = (statusStr: string): OrderStatus => {
  const upper = (statusStr || '').toUpperCase().trim();
  switch (upper) {
    case 'PENDING_PAYMENT':
    case 'NEW':
    case 'PENDING':
      return OrderStatus.Pending;
    case 'PAYMENT_VERIFIED':
    case 'CONFIRMED':
    case 'PAID':
      return OrderStatus.Paid;
    case 'PACKING':
    case 'PROCESSING':
      return OrderStatus.Packing;
    case 'READY_TO_SHIP':
      return OrderStatus.ReadyToShip;
    case 'SHIPPING':
    case 'SHIPPED':
      return OrderStatus.Shipped;
    case 'DELIVERED':
    case 'COMPLETED':
      return OrderStatus.Completed;
    case 'CANCEL_REQUESTED':
    case 'CANCELLED':
      return OrderStatus.Cancelled;
    case 'REFUND':
    case 'REFUNDED':
      return OrderStatus.Refunded;
    default:
      return OrderStatus.Pending;
  }
};

const mapPrismaEnumToFrontendStatus = (enumVal: string): string => {
  switch (enumVal) {
    case 'Pending':
    case 'WaitingPayment':
      return 'PENDING_PAYMENT';
    case 'Paid':
      return 'CONFIRMED';
    case 'Packing':
      return 'PROCESSING';
    case 'ReadyToShip':
      return 'READY_TO_SHIP';
    case 'Shipped':
      return 'SHIPPED';
    case 'Completed':
      return 'DELIVERED';
    case 'Cancelled':
      return 'CANCELLED';
    case 'Refunded':
      return 'REFUND';
    default:
      return enumVal ? enumVal.toUpperCase() : 'PENDING_PAYMENT';
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  const customerId = searchParams.get('customerId');
  const orderNumberParam = searchParams.get('orderNumber') || searchParams.get('orderNo') || '';
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    // Build Prisma query condition
    const whereCondition: any = { deletedAt: null };

    if (statusFilter && statusFilter !== 'ALL') {
      whereCondition.status = mapFrontendStatusToPrismaEnum(statusFilter);
    }

    if (orderNumberParam.trim()) {
      const cleanNum = orderNumberParam.trim().replace(/^#/, '');
      whereCondition.OR = [
        { orderNumber: { contains: cleanNum, mode: 'insensitive' } },
        { id: { contains: cleanNum, mode: 'insensitive' } },
      ];
    } else if (search.trim()) {
      const q = search.trim().toLowerCase().replace(/^#/, '');
      whereCondition.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { items: { some: { productName: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [prismaOrders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        include: { items: true, timelines: { orderBy: { createdAt: 'asc' } }, tracking: true, payments: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: whereCondition }),
    ]);

    if (prismaOrders) {
      const formatted = prismaOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerId: o.customerId || undefined,
        customerName: o.customerName,
        customerEmail: o.customerEmail || undefined,
        customerPhone: o.customerPhone,
        address: o.address,
        city: o.city,
        state: o.state,
        postcode: o.postcode,
        notes: o.notes || undefined,
        totalAmount: o.totalAmount,
        orderStatus: mapPrismaEnumToFrontendStatus(o.status),
        courierName: o.tracking?.courierName,
        trackingNumber: o.tracking?.trackingNumber,
        items: o.items.map(i => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productVariantId: i.variantId || '',
          productName: i.productName,
          variantName: i.variantName,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.subtotal,
          mainImage: i.mainImage || undefined,
        })),
        timeline: (o.timelines || []).map(t => ({
          id: t.id,
          orderId: t.orderId,
          status: mapPrismaEnumToFrontendStatus(t.status),
          title: t.title,
          description: t.description || '',
          timestamp: t.createdAt.toISOString(),
          updatedBy: t.updatedBy || 'Admin Store',
        })),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));

      const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' };

      if (email || phone || customerId || orderNumberParam) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
        const cleanNum = (orderNumberParam || '').trim().replace(/^#/, '').toUpperCase();

        const filtered = formatted.filter(o => {
          const matchEmail = cleanEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === cleanEmail;
          const matchPhone = cleanPhone && cleanPhone.length >= 5 && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
          const matchId = customerId && o.customerId && o.customerId === customerId;
          const matchNum = cleanNum && ((o.orderNumber || '').toUpperCase().replace(/^#/, '') === cleanNum || o.id.toUpperCase() === cleanNum);
          return Boolean(matchEmail || matchPhone || matchId || matchNum);
        });
        return NextResponse.json({ success: true, orders: filtered, allOrders: formatted, pagination: { totalCount, page, limit }, source: 'PRISMA_POSTGRES' }, { headers: noCacheHeaders });
      }
      return NextResponse.json({ success: true, orders: formatted, allOrders: formatted, pagination: { totalCount, page, limit }, source: 'PRISMA_POSTGRES' }, { headers: noCacheHeaders });
    }
  } catch (dbErr: any) {
    console.warn('[Prisma DB Warning] Database query failed, using JSON fallback:', dbErr.message);
  }

  // SAFE JSON FALLBACK
  const orders = readServerOrders();
  const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' };

  if (email || phone || customerId) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    const filtered = orders.filter((o: any) => {
      const matchEmail = cleanEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === cleanEmail;
      const matchPhone = cleanPhone && cleanPhone.length >= 6 && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
      const matchId = customerId && o.customerId && o.customerId === customerId;
      return Boolean(matchEmail || matchPhone || matchId);
    });
    return NextResponse.json({ success: true, orders: filtered, allOrders: orders, source: 'JSON_FALLBACK' }, { headers: noCacheHeaders });
  }

  return NextResponse.json({ success: true, orders, allOrders: orders, source: 'JSON_FALLBACK' }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerInfo = body.customerInfo || {
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
      address: body.address,
      city: body.city,
      state: body.state,
      postcode: body.postcode,
      notes: body.notes,
    };
    const cartItems = body.cartItems || body.items || [];

    const orderNumber = body.orderNumber || `FBS-${Date.now()}`;

    try {
      // PRISMA ATOMIC TRANSACTION FOR ORDER CREATION, PRICE VALIDATION & STOCK BOOKING
      const savedPrismaOrder = await prisma.$transaction(async (tx) => {
        // Idempotency check: If order number already exists, return existing order
        const existingOrder = await tx.order.findUnique({
          where: { orderNumber },
          include: { items: true, tracking: true, timelines: true },
        });

        if (existingOrder) {
          return existingOrder;
        }

        let subtotal = 0;
        const orderItemsData = [];

        // 1. Validasi Stok dan Harga ASLI dari Database
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          for (const item of cartItems) {
            const varId = item.variantId || item.productVariantId;
            let variant = null;

            if (varId) {
              variant = await tx.variant.findUnique({
                where: { id: varId },
                include: { product: true },
              });
            }

            const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);

            if (variant) {
              if (variant.stock < itemQty) {
                throw new Error(`Stok ${variant.product?.productName || variant.variantName} tidak mencukupi. Sisa stok: ${variant.stock}`);
              }

              const itemSubtotal = variant.price * itemQty;
              subtotal += itemSubtotal;

              orderItemsData.push({
                productId: variant.productId,
                variantId: variant.id,
                productName: variant.product?.productName || item.productName || 'Produk Bakery',
                variantName: variant.variantName,
                price: variant.price, // Harga asli dari DB!
                quantity: itemQty,
                subtotal: itemSubtotal,
              });

              // 2. Kunci (Booking) Stok sementara pesanan berstatus PENDING
              await tx.variant.update({
                where: { id: variant.id },
                data: { stock: { decrement: itemQty } },
              });
            } else {
              // Fallback for custom or direct items
              const itemPrice = parseFloat(item.price) || 0;
              const itemSubtotal = itemPrice * itemQty;
              subtotal += itemSubtotal;

              orderItemsData.push({
                productId: item.productId || `prod-${Date.now()}`,
                variantId: null,
                productName: item.productName || 'Produk Bakery',
                variantName: item.variantName || 'Standard',
                price: itemPrice,
                quantity: itemQty,
                subtotal: itemSubtotal,
              });
            }
          }
        } else {
          subtotal = parseFloat(body.totalAmount) || 0;
        }

        const shippingFee = parseFloat(body.shippingFee) || 10.0;
        const discount = parseFloat(body.discount) || 0.0;
        const totalAmount = Math.max(0, subtotal + shippingFee - discount);
        const statusEnum = body.orderStatus === 'CONFIRMED' || body.orderStatus === 'PAID' ? OrderStatus.Paid : OrderStatus.Pending;

        // 3. Buat Pesanan di Database
        const order = await tx.order.create({
          data: {
            id: body.id || `ord-${Date.now()}`,
            orderNumber,
            customerName: customerInfo.name || customerInfo.customerName || 'Pelanggan',
            customerEmail: customerInfo.email || customerInfo.customerEmail || 'customer@fbsbaker.store',
            customerPhone: customerInfo.phone || customerInfo.customerPhone || '',
            address: customerInfo.address || 'Alamat Utama',
            city: customerInfo.city || 'Chukai',
            state: customerInfo.state || 'Terengganu',
            postcode: customerInfo.postcode || '24000',
            notes: customerInfo.notes || body.notes,
            subtotal,
            shippingFee,
            discount,
            totalAmount,
            status: statusEnum,
            items: { create: orderItemsData },
            timelines: {
              create: {
                status: statusEnum,
                title: "Pesanan Dibuat",
                description: "Pelanggan telah membuat pesanan dan stok inventaris telah dikunci.",
                updatedBy: "System",
              },
            },
          },
          include: { items: true, timelines: true },
        });

        if (body.trackingNumber) {
          await tx.tracking.create({
            data: {
              orderId: order.id,
              courierName: body.courierName || 'J&T Express',
              trackingNumber: body.trackingNumber,
              trackingUrl: `https://www.jtexpress.my/tracking/${encodeURIComponent(body.trackingNumber)}`,
            },
          });
        }

        await tx.notification.create({
          data: {
            title: `Pesanan Baru ${order.orderNumber}`,
            message: `Pesanan baru senilai RM ${order.totalAmount} telah diterima.`,
            type: 'ORDER_UPDATE',
          },
        }).catch(() => {});

        return order;
      });

      console.log('✅ [Prisma Transaction Success] Order created & stock booked:', savedPrismaOrder.orderNumber);
      return NextResponse.json({ success: true, order: savedPrismaOrder, source: 'PRISMA_POSTGRES' });
    } catch (dbErr: any) {
      console.error('[Prisma Transaction Error] Failed to process Order:', dbErr);
      return NextResponse.json({ success: false, error: dbErr.message || 'Gagal memproses pesanan' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, orderNumber, orderStatus, courierName, trackingNumber, updatedBy, bulkOrderIds } = body || {};

    // HANDLE BULK STATUS UPDATE
    if (Array.isArray(bulkOrderIds) && bulkOrderIds.length > 0 && orderStatus) {
      try {
        const updatedCount = await prisma.$transaction(async (tx) => {
          let count = 0;
          for (const targetId of bulkOrderIds) {
            const existing = await tx.order.findFirst({
              where: { OR: [{ id: targetId }, { orderNumber: targetId }] },
            });
            if (existing) {
              await tx.order.update({
                where: { id: existing.id },
                data: { status: orderStatus as any, updatedAt: new Date() },
              });
              await tx.timeline.create({
                data: {
                  orderId: existing.id,
                  status: orderStatus as any,
                  title: `Status: ${orderStatus}`,
                  description: `Status pesanan diperbarui secara masal.`,
                  updatedBy: updatedBy || 'Admin Store',
                },
              });
              count++;
            }
          }
          return count;
        });

        return NextResponse.json({ success: true, count: updatedCount, source: 'PRISMA_POSTGRES' });
      } catch (bulkErr) {
        console.warn('Bulk update warning:', bulkErr);
      }
    }

    if (!id && !orderNumber) {
      return NextResponse.json({ success: false, error: 'Order ID or Order Number is required' }, { status: 400 });
    }

    try {
      // PRISMA ATOMIC TRANSACTION FOR ORDER STATUS, TIMELINE, TRACKING & STOCK RESTORATION
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const existing = await tx.order.findFirst({
          where: {
            OR: [
              { id: id || '' },
              { orderNumber: orderNumber || '' },
            ],
          },
          include: { items: true, tracking: true, timelines: true },
        });

        if (!existing) {
          throw new Error('Order not found in database');
        }

        const prismaNewStatus = orderStatus ? mapFrontendStatusToPrismaEnum(orderStatus) : existing.status;
        const previousStatus = existing.status;

        // Idempotency: If status, courier, and tracking number are identical, return early without duplicate timeline
        if (
          existing.status === prismaNewStatus &&
          (!courierName || existing.tracking?.courierName === courierName) &&
          (trackingNumber === undefined || existing.tracking?.trackingNumber === trackingNumber)
        ) {
          return existing;
        }

        // Update Order Status
        const updated = await tx.order.update({
          where: { id: existing.id },
          data: {
            status: prismaNewStatus,
            updatedAt: new Date(),
          },
        });

        // Update / Create Tracking Info if courier or tracking number provided
        if (courierName || trackingNumber) {
          await tx.tracking.upsert({
            where: { orderId: existing.id },
            update: {
              courierName: courierName || existing.tracking?.courierName || 'J&T Express',
              trackingNumber: trackingNumber !== undefined ? trackingNumber : existing.tracking?.trackingNumber,
              trackingUrl: trackingNumber ? `https://www.jtexpress.my/tracking/${encodeURIComponent(trackingNumber)}` : undefined,
            },
            create: {
              orderId: existing.id,
              courierName: courierName || 'J&T Express',
              trackingNumber: trackingNumber || '',
              trackingUrl: trackingNumber ? `https://www.jtexpress.my/tracking/${encodeURIComponent(trackingNumber)}` : '',
            },
          });
        }

        // Automatically create EXACTLY ONE Timeline entry
        const statusTitleMap: Record<string, string> = {
          PENDING_PAYMENT: 'Menunggu Pembayaran',
          PAYMENT_VERIFIED: 'Pembayaran Terverifikasi',
          CONFIRMED: 'Pesanan Dikonfirmasi',
          PACKING: 'Sedang Dikemas',
          READY_TO_SHIP: 'Siap Dikirim',
          SHIPPING: 'Dalam Pengiriman',
          SHIPPED: 'Dalam Pengiriman',
          DELIVERED: 'Pesanan Diterima',
          COMPLETED: 'Pesanan Selesai',
          CANCEL_REQUESTED: 'Permintaan Pembatalan',
          CANCELLED: 'Pesanan Dibatalkan',
          REFUND: 'Pengembalian Dana',
        };

        const displayStatus = orderStatus || mapPrismaEnumToFrontendStatus(prismaNewStatus);
        const title = statusTitleMap[displayStatus] || `Status: ${displayStatus}`;
        const description = trackingNumber
          ? `Status pesanan diperbarui menjadi ${displayStatus} (${courierName || 'Kurir'} - Resi: ${trackingNumber}).`
          : `Status pesanan diperbarui menjadi ${displayStatus}.`;

        await tx.timeline.create({
          data: {
            orderId: existing.id,
            status: prismaNewStatus,
            title,
            description,
            updatedBy: updatedBy || 'Admin Store',
          },
        });

        // Stock Restoration if order transitioned to CANCELLED
        if (
          ((newStatus as string) === 'CANCELLED' || (newStatus as string) === 'Cancelled') &&
          (previousStatus as string) !== 'CANCELLED' &&
          (previousStatus as string) !== 'Cancelled'
        ) {
          for (const item of existing.items) {
            if (item.variantId) {
              await tx.variant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              }).catch(err => console.warn('Stock restoration warning:', err));
            }
          }
        }

        return tx.order.findUnique({
          where: { id: existing.id },
          include: { items: true, timelines: true, tracking: true },
        });
      });

      console.log('✅ [Prisma PATCH Success] Order status updated:', updatedOrder?.orderNumber);
      return NextResponse.json({ success: true, order: updatedOrder, source: 'PRISMA_POSTGRES' });
    } catch (dbErr: any) {
      console.error('[Prisma PATCH Error] Failed to update order status:', dbErr);
      return NextResponse.json({ success: false, error: `Database Error: ${dbErr.message}` }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteId = searchParams.get('deleteId');
    if (!deleteId) {
      return NextResponse.json({ success: false, error: 'deleteId parameter is required' }, { status: 400 });
    }

    try {
      const result = await prisma.order.updateMany({
        where: {
          OR: [
            { id: deleteId },
            { orderNumber: deleteId },
          ],
        },
        data: { deletedAt: new Date() },
      });
      console.log('✅ [Prisma Soft Delete Success]:', deleteId);
      return NextResponse.json({ success: true, count: result.count, source: 'PRISMA_POSTGRES' });
    } catch (dbErr: any) {
      console.error('[Prisma Soft Delete Error]:', dbErr);
      return NextResponse.json({ success: false, error: `Database Error: ${dbErr.message}` }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
