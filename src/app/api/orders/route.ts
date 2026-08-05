import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

declare global {
  var __fbs_orders_cache: any[] | undefined;
}

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
      globalThis.__fbs_orders_cache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return globalThis.__fbs_orders_cache || [];
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
