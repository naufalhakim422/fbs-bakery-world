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

function normalizePhoneDigits(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

function formatCustomerWithAddress(c: any) {
  if (!c) return null;
  const primaryAddr = (c.addresses && c.addresses.length > 0) ? c.addresses[0] : null;
  return {
    ...c,
    address: primaryAddr?.address || c.address || '',
    city: primaryAddr?.city || c.city || '',
    postcode: primaryAddr?.postcode || c.postcode || '',
    state: primaryAddr?.state || c.state || '',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  try {
    const dbCustomers = await prisma.customer.findMany({
      where: { deletedAt: null },
      include: { addresses: true },
      orderBy: { createdAt: 'desc' },
    });

    if (dbCustomers) {
      const formattedList = dbCustomers.map(formatCustomerWithAddress);

      if (email || phone) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPhone = normalizePhoneDigits(phone);

        const found = formattedList.find(c => {
          if (cleanEmail && c.email && c.email.trim().toLowerCase() === cleanEmail) return true;
          if (cleanPhone) {
            const custPhone = normalizePhoneDigits(c.phone);
            if (custPhone && (custPhone === cleanPhone || custPhone.includes(cleanPhone) || cleanPhone.includes(custPhone))) {
              return true;
            }
          }
          return false;
        });

        return NextResponse.json({ success: true, customer: found || null, customers: formattedList, source: 'PRISMA_POSTGRES' });
      }

      return NextResponse.json({ success: true, customers: formattedList, source: 'PRISMA_POSTGRES' });
    }
  } catch (err: any) {
    console.warn('[Prisma Customer Warning] Database query failed, using JSON fallback:', err.message);
  }

  // SAFE JSON FALLBACK
  const customers = readServerCustomers();
  if (email || phone) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = normalizePhoneDigits(phone);

    const found = customers.find((c: any) => {
      if (cleanEmail && c.email && c.email.trim().toLowerCase() === cleanEmail) return true;
      if (cleanPhone) {
        const custPhone = normalizePhoneDigits(c.phone);
        if (custPhone && (custPhone === cleanPhone || custPhone.includes(cleanPhone) || cleanPhone.includes(custPhone))) {
          return true;
        }
      }
      return false;
    });

    return NextResponse.json({ success: true, customer: found || null, customers, source: 'JSON_FALLBACK' });
  }

  return NextResponse.json({ success: true, customers, source: 'JSON_FALLBACK' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || (!body.email && !body.phone)) {
      return NextResponse.json({ success: false, error: 'Email or Phone is required' }, { status: 400 });
    }

    const cleanEmail = (body.email || '').trim().toLowerCase();
    const cleanPhone = (body.phone || '').trim();

    try {
      // 1. Check existing customer to preserve real phone and email
      let existingCust = null;
      if (cleanEmail) {
        existingCust = await prisma.customer.findUnique({
          where: { email: cleanEmail },
          include: { addresses: true },
        });
      }

      if (!existingCust && cleanPhone) {
        existingCust = await prisma.customer.findFirst({
          where: { phone: cleanPhone },
          include: { addresses: true },
        });
      }

      const targetEmail = cleanEmail || existingCust?.email || `customer-${Date.now()}@fbsbaker.store`;
      const targetPhone = cleanPhone || existingCust?.phone || `01${Date.now()}`;

      // 2. Safe Prisma Upsert (P2002 Constraint Protection)
      let targetCust = null;
      try {
        targetCust = await prisma.customer.upsert({
          where: { email: targetEmail },
          update: {
            name: body.name || existingCust?.name || 'Pelanggan FBS',
            phone: targetPhone,
            photo: body.photo !== undefined ? body.photo : existingCust?.photo,
            coverPhoto: body.coverPhoto !== undefined ? body.coverPhoto : existingCust?.coverPhoto,
          },
          create: {
            id: body.id || existingCust?.id || `cust-${Date.now()}`,
            name: body.name || 'Pelanggan FBS',
            email: targetEmail,
            phone: targetPhone,
            photo: body.photo || '',
            coverPhoto: body.coverPhoto || '',
            customerType: 'RETAIL',
          },
          include: { addresses: true },
        });
      } catch (upsertErr: any) {
        // P2002 safe fallback: Phone constraint violation -> update profile without overwriting phone
        if (upsertErr.code === 'P2002') {
          targetCust = await prisma.customer.update({
            where: { email: targetEmail },
            data: {
              name: body.name || 'Pelanggan FBS',
              photo: body.photo !== undefined ? body.photo : undefined,
              coverPhoto: body.coverPhoto !== undefined ? body.coverPhoto : undefined,
            },
            include: { addresses: true },
          });
        } else {
          throw upsertErr;
        }
      }

      // 3. Save / Update Primary Address in PostgreSQL Address Table
      if (targetCust && (body.address || body.city || body.postcode || body.state)) {
        try {
          const existingAddr = await prisma.address.findFirst({
            where: { customerId: targetCust.id },
          });

          if (existingAddr) {
            await prisma.address.update({
              where: { id: existingAddr.id },
              data: {
                recipient: body.name || targetCust.name,
                phone: targetCust.phone,
                address: body.address || existingAddr.address,
                city: body.city || existingAddr.city || 'Shah Alam',
                postcode: body.postcode || existingAddr.postcode || '40000',
                state: body.state || existingAddr.state || 'Selangor',
              },
            });
          } else {
            await prisma.address.create({
              data: {
                id: `addr-${Date.now()}`,
                customerId: targetCust.id,
                label: 'Utama',
                recipient: body.name || targetCust.name,
                phone: targetCust.phone,
                address: body.address || 'Alamat Utama',
                city: body.city || 'Shah Alam',
                postcode: body.postcode || '40000',
                state: body.state || 'Selangor',
              },
            });
          }
        } catch (addrErr) {
          console.warn('[Prisma Address Upsert Warning]:', addrErr);
        }
      }

      // Re-fetch formatted customer with address relation
      const finalCust = await prisma.customer.findUnique({
        where: { id: targetCust.id },
        include: { addresses: true },
      });

      const fullCustomer = formatCustomerWithAddress(finalCust) || {
        ...targetCust,
        address: body.address || '',
        city: body.city || '',
        postcode: body.postcode || '',
        state: body.state || '',
      };

      // Also persist to server JSON cache for fallback consistency
      const serverCustomers = readServerCustomers();
      const existingIdx = serverCustomers.findIndex((c: any) => c.email && c.email.toLowerCase() === targetEmail);
      if (existingIdx !== -1) {
        serverCustomers[existingIdx] = { ...serverCustomers[existingIdx], ...fullCustomer };
      } else {
        serverCustomers.unshift(fullCustomer);
      }
      writeServerCustomers(serverCustomers);

      console.log('✅ [Prisma Customer & Address Upsert Success]:', targetCust.email);
      return NextResponse.json({ success: true, customer: fullCustomer, source: 'PRISMA_POSTGRES' });
    } catch (dbErr: any) {
      console.error('[Prisma Customer POST Error]:', dbErr);
      return NextResponse.json({ success: false, error: `Database Error: ${dbErr.message}` }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
