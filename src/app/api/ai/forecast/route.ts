import { NextResponse } from 'next/server';
import { generateAISalesForecast } from '@/lib/ai-forecast';
import { analyzeInventoryShortages } from '@/lib/predictive-inventory';
import { generateCustomerIntelligence } from '@/lib/customer-intelligence';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [salesForecast, shortageWarnings, customerProfiles] = await Promise.all([
      generateAISalesForecast(),
      analyzeInventoryShortages(),
      generateCustomerIntelligence(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      salesForecast,
      shortageWarnings,
      customerProfiles,
      source: 'PRISMA_POSTGRES_AI_ENGINE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
