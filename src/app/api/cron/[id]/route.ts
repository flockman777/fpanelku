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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cronJob = await db.cronJob.findUnique({
      where: { id: params.id },
    });

    if (!cronJob) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    return NextResponse.json(cronJob);
  } catch (error) {
    console.error('Error fetching cron job:', error);
    return NextResponse.json({ error: 'Failed to fetch cron job' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, command, schedule, enabled } = await req.json();

    // Check if cron job exists
    const existingJob = await db.cronJob.findUnique({
      where: { id: params.id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    // Validate cron expression if provided
    if (schedule) {
      const cronRegex = /^(\*|([0-9]|[1-5][0-9])|\*\/[0-9]+)\s(\*|([0-9]|1[0-9]|2[0-3])|\*\/[0-9]+)\s(\*|([1-9]|[12][0-9]|3[01])|\*\/[0-9]+)\s(\*|([1-9]|1[0-2])|\*\/[0-9]+)\s(\*|[0-6])$/;
      if (!cronRegex.test(schedule)) {
        return NextResponse.json(
          { error: 'Invalid cron expression' },
          { status: 400 }
        );
      }
    }

    // Update cron job
    const updatedJob = await db.cronJob.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(command && { command }),
        ...(schedule && { schedule }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating cron job:', error);
    return NextResponse.json({ error: 'Failed to update cron job' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if cron job exists
    const existingJob = await db.cronJob.findUnique({
      where: { id: params.id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    // Delete cron job
    await db.cronJob.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Cron job deleted successfully' });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    return NextResponse.json({ error: 'Failed to delete cron job' }, { status: 500 });
  }
}
