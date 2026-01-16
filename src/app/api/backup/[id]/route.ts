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

    const backup = await db.backup.findUnique({
      where: { id: params.id },
    });

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Error fetching backup:', error);
    return NextResponse.json({ error: 'Failed to fetch backup' }, { status: 500 });
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

    // Check if backup exists
    const existingBackup = await db.backup.findUnique({
      where: { id: params.id },
    });

    if (!existingBackup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // Delete backup
    await db.backup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}
