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

    const backups = await db.backup.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
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

    const { type } = await req.json();

    if (!type || !['full', 'database', 'files'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid backup type is required (full, database, or files)' },
        { status: 400 }
      );
    }

    const backupName = `${type}-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;

    // Create backup record
    const backup = await db.backup.create({
      data: {
        name: backupName,
        type,
        path: `/backups/${backupName}`,
        size: 0, // Will be updated when backup completes
        status: 'pending',
      },
    });

    // In production, this would trigger actual backup process
    // For demo, we'll mark it as completed after a delay

    setTimeout(async () => {
      try {
        await db.backup.update({
          where: { id: backup.id },
          data: {
            status: 'completed',
            size: Math.floor(Math.random() * 1073741824), // Random size for demo (1GB max)
          },
        });
      } catch (error) {
        console.error('Error updating backup status:', error);
      }
    }, 5000); // Simulate 5 seconds backup time

    return NextResponse.json({
      message: 'Backup creation started',
      backup,
      note: 'In production, this would create an actual backup. For demo purposes, backup will be marked as completed after 5 seconds.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
