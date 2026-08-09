import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

declare global {
  var __fbs_reviews_cache: any[] | undefined;
}

function getDataFilePath(): string {
  const localDir = path.join(process.cwd(), 'data');
  const localFile = path.join(localDir, 'fbs_reviews.json');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch (e) {
    return path.join(os.tmpdir(), 'fbs_reviews.json');
  }
}

function readServerReviews(): any[] {
  if (globalThis.__fbs_reviews_cache && globalThis.__fbs_reviews_cache.length > 0) {
    return globalThis.__fbs_reviews_cache;
  }
  const file = getDataFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      globalThis.__fbs_reviews_cache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading reviews file:', err);
  }
  return globalThis.__fbs_reviews_cache || [];
}

function writeServerReviews(reviews: any[]) {
  globalThis.__fbs_reviews_cache = reviews;
  const file = getDataFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    try {
      const tmpFile = path.join(os.tmpdir(), 'fbs_reviews.json');
      fs.writeFileSync(tmpFile, JSON.stringify(reviews, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing tmp reviews:', tmpErr);
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  try {
    const dbReviews = await prisma.review.findMany({
      where: {
        deletedAt: null,
        ...(productId ? { productId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
      },
    });

    if (dbReviews && dbReviews.length > 0) {
      return NextResponse.json({ success: true, reviews: dbReviews, source: 'PRISMA_POSTGRES' });
    }
  } catch (err: any) {
    console.warn('[Prisma Review Warning] Falling back to JSON storage:', err.message);
  }

  // Fallback to server JSON file
  let reviews = readServerReviews();
  if (productId) {
    reviews = reviews.filter((r: any) => r.productId === productId);
  }

  return NextResponse.json({ success: true, reviews, source: 'JSON_FALLBACK' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, customerName, customerEmail, rating, comment, imageUrl, videoUrl } = body || {};

    if (!productId || !comment) {
      return NextResponse.json({ success: false, error: 'Product ID and Comment are required' }, { status: 400 });
    }

    const reviewObj = {
      id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      productId,
      productName: productName || 'Produk Bakery',
      customerName: customerName || 'Pembeli Terverifikasi',
      rating: parseInt(rating, 10) || 5,
      comment,
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      isVerifiedBuyer: true,
      createdAt: new Date().toISOString(),
    };

    // Save to Prisma PostgreSQL if possible
    try {
      let cust = await prisma.customer.findFirst({
        where: { OR: [{ email: customerEmail || '' }, { name: customerName || '' }] },
      });

      if (!cust) {
        cust = await prisma.customer.findFirst();
      }

      if (cust) {
        await prisma.review.create({
          data: {
            id: reviewObj.id,
            productId,
            customerId: cust.id,
            rating: reviewObj.rating,
            comment: reviewObj.comment,
          },
        });
      }
    } catch (dbErr) {
      console.warn('[Prisma Review Post Warning]:', dbErr);
    }

    // Always persist to JSON server storage for guaranteed fallback display
    const serverReviews = readServerReviews();
    serverReviews.unshift(reviewObj);
    writeServerReviews(serverReviews);

    return NextResponse.json({ success: true, review: reviewObj, source: 'SERVER_PERSISTED' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
