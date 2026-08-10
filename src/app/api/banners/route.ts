import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

declare global {
  var __fbs_banners_cache: any[] | undefined;
}

function getDataFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_banners.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_banners.json');
  }
}

function readServerBanners(): any[] {
  if (globalThis.__fbs_banners_cache && globalThis.__fbs_banners_cache.length > 0) {
    return globalThis.__fbs_banners_cache;
  }
  const file = getDataFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      globalThis.__fbs_banners_cache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading banners file:', err);
  }
  return globalThis.__fbs_banners_cache || [];
}

function writeServerBanners(banners: any[]) {
  globalThis.__fbs_banners_cache = banners;
  const file = getDataFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(banners, null, 2), 'utf-8');
  } catch (err) {
    try {
      const tmpFile = path.join(os.tmpdir(), 'fbs_banners.json');
      fs.writeFileSync(tmpFile, JSON.stringify(banners, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing tmp banners:', tmpErr);
    }
  }
}

async function ensureBannerSchemaText() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Banner" ALTER COLUMN "imageUrl" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Banner" ALTER COLUMN "subtitle" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Banner" ALTER COLUMN "linkUrl" TYPE TEXT;`);
  } catch (e) {
    // Ignored if already TEXT or table created
  }
}

const antiCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    await ensureBannerSchemaText();
    const dbBanners = await prisma.banner.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (dbBanners && dbBanners.length > 0) {
      const formatted = dbBanners.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || '',
        imageUrl: b.imageUrl,
        buttonText: 'SHOP PRODUCT NOW',
        buttonLink: b.linkUrl || '/products',
        status: b.isActive,
        sortOrder: b.sortOrder,
      }));
      return NextResponse.json({ success: true, banners: formatted, source: 'PRISMA_POSTGRES' }, { headers: antiCacheHeaders });
    }
  } catch (err: any) {
    console.warn('[Prisma Banner Warning] Falling back to JSON cache:', err.message);
  }

  // Fallback to Server JSON Cache
  const cached = readServerBanners();
  return NextResponse.json({ success: true, banners: cached, source: 'JSON_FALLBACK' }, { headers: antiCacheHeaders });
}

export async function POST(request: Request) {
  try {
    await ensureBannerSchemaText();
    const body = await request.json();
    const bannerList = Array.isArray(body) ? body : body.banners;

    if (!Array.isArray(bannerList)) {
      return NextResponse.json({ success: false, error: 'Array of banners required' }, { status: 400 });
    }

    const activeIds = bannerList.map((b: any) => b.id).filter(Boolean);

    try {
      await prisma.$transaction(async (tx) => {
        // Soft delete removed banners in PostgreSQL Railway
        if (activeIds.length > 0) {
          await tx.banner.updateMany({
            where: {
              id: { notIn: activeIds },
              deletedAt: null,
            },
            data: {
              isActive: false,
              deletedAt: new Date(),
            },
          });
        }

        for (let i = 0; i < bannerList.length; i++) {
          const b = bannerList[i];
          const bId = b.id || `ban-${Date.now()}-${i}`;
          await tx.banner.upsert({
            where: { id: bId },
            update: {
              title: b.title || 'Special Bakery Promo',
              subtitle: b.subtitle || '',
              imageUrl: b.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
              linkUrl: b.buttonLink || b.linkUrl || '/products',
              sortOrder: i + 1,
              isActive: b.status !== undefined ? b.status : true,
              updatedAt: new Date(),
            },
            create: {
              id: bId,
              title: b.title || 'Special Bakery Promo',
              subtitle: b.subtitle || '',
              imageUrl: b.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
              linkUrl: b.buttonLink || b.linkUrl || '/products',
              sortOrder: i + 1,
              isActive: b.status !== undefined ? b.status : true,
            },
          });
        }
      });
      console.log('✅ [Prisma Banners Upsert Success]');
    } catch (dbErr) {
      console.warn('[Prisma Banners POST Warning]:', dbErr);
    }

    writeServerBanners(bannerList);
    return NextResponse.json({ success: true, banners: bannerList, source: 'SERVER_PERSISTED' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
