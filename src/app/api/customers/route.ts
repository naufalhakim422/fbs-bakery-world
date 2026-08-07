import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

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

  try {
    const dbCustomers = await prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (dbCustomers) {
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        const customer = dbCustomers.find(c => c.email && c.email.trim().toLowerCase() === cleanEmail);
        return NextResponse.json({ success: true, customer: customer || null, customers: dbCustomers, source: 'PRISMA_POSTGRES' });
      }
      return NextResponse.json({ success: true, customers: dbCustomers, source: 'PRISMA_POSTGRES' });
    }
  } catch (err: any) {
    console.warn('[Prisma Customer Warning] Database query failed, using JSON fallback:', err.message);
  }

  // SAFE JSON FALLBACK (Retained for Phase 1 Foundation Preparation)
  const customers = readServerCustomers();
  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    const customer = customers.find((c: any) => c.email && c.email.trim().toLowerCase() === cleanEmail);
    return NextResponse.json({ success: true, customer: customer || null, customers, source: 'JSON_FALLBACK' });
  }

  return NextResponse.json({ success: true, customers, source: 'JSON_FALLBACK' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || (!body.email && !body.phone)) {
      return NextResponse.json({ success: false, error: 'Email or Phone is required' }, { status: 400 });
    }

    try {
      const cleanEmail = (body.email || `customer-${Date.now()}@fbsbaker.store`).trim().toLowerCase();
      const cleanPhone = (body.phone || `01${Date.now()}`).trim();

      const upserted = await prisma.customer.upsert({
        where: { email: cleanEmail },
        update: {
          name: body.name || 'Pelanggan FBS',
          phone: cleanPhone,
        },
        create: {
          id: body.id || `cust-${Date.now()}`,
          name: body.name || 'Pelanggan FBS',
          email: cleanEmail,
          phone: cleanPhone,
          customerType: 'RETAIL',
        },
      });

      console.log('✅ [Prisma Customer Upsert Success]:', upserted.email);
      return NextResponse.json({ success: true, customer: upserted, source: 'PRISMA_POSTGRES' });
    } catch (dbErr: any) {
      console.error('[Prisma Customer POST Error]:', dbErr);
      return NextResponse.json({ success: false, error: `Database Error: ${dbErr.message}` }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
