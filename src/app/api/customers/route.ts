import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

declare global {
  var __fbs_customers_cache: any[] | undefined;
}

function getDataFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_customers.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_customers.json');
  }
}

function readServerCustomers(): any[] {
  if (globalThis.__fbs_customers_cache && globalThis.__fbs_customers_cache.length > 0) {
    return globalThis.__fbs_customers_cache;
  }
  const file = getDataFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      globalThis.__fbs_customers_cache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading customers file:', err);
  }
  return globalThis.__fbs_customers_cache || [];
}

function writeServerCustomers(customers: any[]) {
  globalThis.__fbs_customers_cache = customers;
  const file = getDataFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(customers, null, 2), 'utf-8');
  } catch (err) {
    try {
      const tmpFile = path.join(os.tmpdir(), 'fbs_customers.json');
      fs.writeFileSync(tmpFile, JSON.stringify(customers, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing tmp customers:', tmpErr);
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const customers = readServerCustomers();

  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    const customer = customers.find((c: any) => c.email && c.email.trim().toLowerCase() === cleanEmail);
    return NextResponse.json({ success: true, customer: customer || null, customers });
  }

  return NextResponse.json({ success: true, customers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || (!body.email && !body.phone)) {
      return NextResponse.json({ success: false, error: 'Email or Phone is required' }, { status: 400 });
    }

    const customers = readServerCustomers();
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const cleanPhone = (body.phone || '').replace(/[^0-9]/g, '');

    const idx = customers.findIndex((c: any) => 
      (c.id && body.id && c.id === body.id) || 
      (cleanEmail && c.email && c.email.trim().toLowerCase() === cleanEmail) ||
      (cleanPhone && cleanPhone.length > 6 && c.phone && c.phone.replace(/[^0-9]/g, '') === cleanPhone)
    );

    if (idx !== -1) {
      customers[idx] = { 
        ...customers[idx], 
        ...body, 
        updatedAt: new Date().toISOString() 
      };
    } else {
      const newCust = {
        id: body.id || `cust-${Date.now()}`,
        name: body.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Pelanggan FBS'),
        email: cleanEmail,
        phone: body.phone || '',
        customerType: body.customerType || 'RETAIL',
        provider: body.provider || 'FORM',
        isEmailVerified: body.isEmailVerified ?? true,
        isActive: body.isActive ?? true,
        address: body.address || 'Chukai, Terengganu',
        city: body.city || 'Chukai',
        state: body.state || 'Terengganu',
        postcode: body.postcode || '24000',
        createdAt: body.createdAt || new Date().toISOString(),
        loginAt: new Date().toISOString(),
      };
      customers.unshift(newCust);
    }

    writeServerCustomers(customers);
    const targetIdx = idx !== -1 ? idx : 0;
    return NextResponse.json({ success: true, customer: customers[targetIdx], customers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
