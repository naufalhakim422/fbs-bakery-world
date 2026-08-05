import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

declare global {
  var __fbs_orders_cache: any[] | undefined;
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

function readServerOrders(): any[] {
  if (globalThis.__fbs_orders_cache && globalThis.__fbs_orders_cache.length > 0) {
    return globalThis.__fbs_orders_cache;
  }
  const file = getDataFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__fbs_orders_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }

  globalThis.__fbs_orders_cache = defaultInitialOrders;
  return defaultInitialOrders;
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
    return NextResponse.json({ success: true, orders: filtered, allOrders: orders });
  }

  return NextResponse.json({ success: true, orders, allOrders: orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.orderNumber) {
      return NextResponse.json({ success: false, error: 'Order Number is required' }, { status: 400 });
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

    writeServerOrders(orders);
    return NextResponse.json({ success: true, order: orders[0], orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
