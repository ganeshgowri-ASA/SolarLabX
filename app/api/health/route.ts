import { NextResponse } from 'next/server'

const MODULES = [
  'lims', 'qms', 'audit', 'projects', 'uncertainty',
  'vision-ai', 'sop-gen', 'reports', 'sun-simulator',
  'chamber-config', 'procurement',
]

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    timestamp: new Date().toISOString(),
    modules: { count: MODULES.length, names: MODULES },
    uptime_s: Math.round(process.uptime()),
  })
}
