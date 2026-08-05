import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'fbs_customers.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readServerCustomers(): any[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading fbs_customers.json:', err);
  }
  return [];
}

function writeServerCustomers(customers: any[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(customers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fbs_customers.json:', err);
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
