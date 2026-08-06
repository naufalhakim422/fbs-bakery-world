import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'ONLINE';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'OFFLINE';
  }

  const memoryUsage = process.memoryUsage();
  const heapUsedMb = Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100;
  const heapTotalMb = Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100;

  return NextResponse.json({
    status: dbStatus === 'ONLINE' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs: Date.now() - startTime,
    components: {
      application: { status: 'ONLINE', version: '1.0.0' },
      database: { status: dbStatus, latencyMs: dbLatencyMs, engine: 'PostgreSQL' },
      api: { status: 'ONLINE' },
      storage: { status: 'HEALTHY', provider: 'Railway / Vercel' },
      memory: { heapUsedMb, heapTotalMb }
    }
  });
}
