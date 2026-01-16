import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    // Get CPU usage (simplified)
    const cpuUsage = Math.floor(Math.random() * 30 + 10); // 10-40%

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryPercent = Math.floor((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    // Get disk usage (simplified, would need actual file system check)
    const diskUsage = Math.floor(Math.random() * 40 + 20); // 20-60%

    return NextResponse.json({
      cpu: cpuUsage,
      ram: memoryPercent,
      disk: diskUsage,
      uptime: `${days}d ${hours}h ${minutes}m`,
    });
  } catch (error) {
    console.error('Error getting server stats:', error);
    return NextResponse.json(
      { error: 'Failed to get server stats' },
      { status: 500 }
    );
  }
}
