import { NextResponse } from 'next/server';
import { getMultiWarehouseList, getMultiBranchList, runBusinessAutomationEngine, getProductionBackupStatus } from '@/lib/enterprise-v2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [warehouses, branches, automationTasks] = await Promise.all([
      getMultiWarehouseList(),
      getMultiBranchList(),
      runBusinessAutomationEngine(),
    ]);

    const backupStatus = getProductionBackupStatus();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      version: 'v2.0 Enterprise Ready',
      warehouses,
      branches,
      automationTasks,
      backupStatus,
      source: 'PRISMA_POSTGRES_ENTERPRISE_V2_ENGINE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
