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

    const ftpUsers = await db.fTPUser.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(ftpUsers);
  } catch (error) {
    console.error('Error fetching FTP users:', error);
    return NextResponse.json({ error: 'Failed to fetch FTP users' }, { status: 500 });
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

    const { username, password, homePath, quota } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.fTPUser.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Create FTP user
    const newFtpUser = await db.fTPUser.create({
      data: {
        username,
        password,
        homePath: homePath || '/',
        quota: quota || 1024,
        used: 0,
      },
    });

    return NextResponse.json(newFtpUser, { status: 201 });
  } catch (error) {
    console.error('Error creating FTP user:', error);
    return NextResponse.json({ error: 'Failed to create FTP user' }, { status: 500 });
  }
}
