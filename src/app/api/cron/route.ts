import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function getUserFromToken(token: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cronJobs = await db.cronJob.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cronJobs);
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch cron jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, command, schedule } = await req.json();

    if (!name || !command || !schedule) {
      return NextResponse.json(
        { error: 'Name, command, and schedule are required' },
        { status: 400 }
      );
    }

    // Validate cron expression (basic validation)
    const cronRegex = /^(\*|([0-9]|[1-5][0-9])|\*\/[0-9]+)\s(\*|([0-9]|1[0-9]|2[0-3])|\*\/[0-9]+)\s(\*|([1-9]|[12][0-9]|3[01])|\*\/[0-9]+)\s(\*|([1-9]|1[0-2])|\*\/[0-9]+)\s(\*|[0-6])$/;
    if (!cronRegex.test(schedule)) {
      return NextResponse.json(
        { error: 'Invalid cron expression' },
        { status: 400 }
      );
    }

    // Create cron job
    const newCronJob = await db.cronJob.create({
      data: {
        name,
        command,
        schedule,
        enabled: true,
      },
    });

    return NextResponse.json(newCronJob, { status: 201 });
  } catch (error) {
    console.error('Error creating cron job:', error);
    return NextResponse.json({ error: 'Failed to create cron job' }, { status: 500 });
  }
}
