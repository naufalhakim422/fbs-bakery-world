import { NextResponse } from 'next/server';
import { syncShopeeSellerCenter, syncTikTokShopSellerCenter } from '@/lib/marketplace';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { channel } = await request.json().catch(() => ({ channel: 'ALL' }));

    let shopeeResult = null;
    let tikTokResult = null;

    if (channel === 'SHOPEE' || channel === 'ALL') {
      shopeeResult = await syncShopeeSellerCenter();
    }

    if (channel === 'TIKTOK_SHOP' || channel === 'ALL') {
      tikTokResult = await syncTikTokShopSellerCenter();
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      shopee: shopeeResult,
      tikTokShop: tikTokResult,
      message: 'Omnichannel inventory & order sync executed successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
