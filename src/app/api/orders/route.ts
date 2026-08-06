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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  const customerId = searchParams.get('customerId');

  try {
    const prismaOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: { items: true, timelines: true, tracking: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    if (prismaOrders && prismaOrders.length > 0) {
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
        orderStatus: o.status === 'Pending' ? 'PENDING_PAYMENT' : o.status.toUpperCase(),
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
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));

      if (email || phone || customerId) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
        const filtered = formatted.filter(o => {
          const matchEmail = cleanEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === cleanEmail;
          const matchPhone = cleanPhone && cleanPhone.length >= 6 && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
          const matchId = customerId && o.customerId && o.customerId === customerId;
          return Boolean(matchEmail || matchPhone || matchId);
        });
        return NextResponse.json({ success: true, orders: filtered, allOrders: formatted, source: 'PRISMA_POSTGRES' });
      }
      return NextResponse.json({ success: true, orders: formatted, allOrders: formatted, source: 'PRISMA_POSTGRES' });
    }
  } catch (dbErr) {
    console.warn('[Prisma DB Warning] Falling back to JSON database:', dbErr);
  }

  // JSON FALLBACK
  const orders = readServerOrders();
  if (email || phone || customerId) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    const filtered = orders.filter((o: any) => {
      const matchEmail = cleanEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === cleanEmail;
      const matchPhone = cleanPhone && cleanPhone.length >= 6 && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone);
      const matchId = customerId && o.customerId && o.customerId === customerId;
      return Boolean(matchEmail || matchPhone || matchId);
    });
    return NextResponse.json({ success: true, orders: filtered, allOrders: orders, source: 'JSON_FALLBACK' });
  }

  return NextResponse.json({ success: true, orders, allOrders: orders, source: 'JSON_FALLBACK' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.orderNumber) {
      return NextResponse.json({ success: false, error: 'Order Number is required' }, { status: 400 });
    }

    try {
      // PRISMA ATOMIC TRANSACTION
      const savedPrismaOrder = await prisma.$transaction(async (tx) => {
        const orderId = body.id || `ord-${Date.now()}`;
        const statusEnum = body.orderStatus === 'PENDING_PAYMENT' ? 'Pending' : 'Paid';

        const updatedOrder = await tx.order.upsert({
          where: { orderNumber: body.orderNumber },
          update: {
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            totalAmount: body.totalAmount || 0,
            status: statusEnum as any,
          },
          create: {
            id: orderId,
            orderNumber: body.orderNumber,
            customerName: body.customerName,
            customerEmail: body.customerEmail || 'customer@fbsbaker.store',
            customerPhone: body.customerPhone,
            address: body.address || 'Alamat Utama',
            city: body.city || 'Kuala Lumpur',
            state: body.state || 'Wilayah Persekutuan',
            postcode: body.postcode || '50000',
            notes: body.notes,
            subtotal: body.totalAmount || 0,
            shippingFee: 10.0,
            discount: 0.0,
            totalAmount: body.totalAmount || 0,
            status: statusEnum as any,
          },
        });

        if (body.trackingNumber) {
          await tx.tracking.upsert({
            where: { orderId: updatedOrder.id },
            update: { trackingNumber: body.trackingNumber, courierName: body.courierName || 'J&T Express' },
            create: {
              orderId: updatedOrder.id,
              courierName: body.courierName || 'J&T Express',
              trackingNumber: body.trackingNumber,
              trackingUrl: `https://www.jtexpress.my/tracking/${encodeURIComponent(body.trackingNumber)}`,
            },
          });
        }

        await tx.timeline.create({
          data: {
            orderId: updatedOrder.id,
            status: statusEnum as any,
            title: `Status: ${body.orderStatus}`,
            description: `Pesanan telah diperbarui.`,
            updatedBy: 'Admin Store',
          },
        });

        return updatedOrder;
      });

      console.log('✅ [Prisma Transaction Success] Saved order:', savedPrismaOrder.orderNumber);
    } catch (dbErr) {
      console.warn('[Prisma POST Warning] Failed to write Prisma, using JSON fallback:', dbErr);
    }

    const orders = readServerOrders();
    const idx = orders.findIndex((o: any) => o.orderNumber === body.orderNumber || (o.id && body.id && o.id === body.id));

    if (idx !== -1) {
      orders[idx] = { 
        ...orders[idx], 
        ...body, 
        updatedAt: new Date().toISOString() 
      };
    } else {
      orders.unshift(body);
    }

    if (body.id || body.orderNumber) {
      writeStatusOverride(body.id, body.orderNumber, {
        orderStatus: body.orderStatus,
        courierName: body.courierName,
        trackingNumber: body.trackingNumber,
        updatedAt: body.updatedAt || new Date().toISOString(),
      });
    }

    const targetIdx = idx !== -1 ? idx : 0;
    writeServerOrders(orders);
    return NextResponse.json({ success: true, order: orders[targetIdx], orders });
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

    const deletedIds = readDeletedOrderIds();
    if (!deletedIds.includes(deleteId)) {
      deletedIds.push(deleteId);
    }

    let orders = readServerOrders();
    const targetObj = orders.find((o: any) => o.id === deleteId || o.orderNumber === deleteId);
    if (targetObj) {
      if (targetObj.id && !deletedIds.includes(targetObj.id)) deletedIds.push(targetObj.id);
      if (targetObj.orderNumber && !deletedIds.includes(targetObj.orderNumber)) deletedIds.push(targetObj.orderNumber);
    }
    writeDeletedOrderIds(deletedIds);

    orders = orders.filter((o: any) => 
      o.id !== deleteId && 
      o.orderNumber !== deleteId && 
      (!targetObj || (o.id !== targetObj.id && o.orderNumber !== targetObj.orderNumber))
    );
    writeServerOrders(orders);

    return NextResponse.json({ success: true, orders, deletedIds });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
