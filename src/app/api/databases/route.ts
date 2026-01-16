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

    const databases = await db.database.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(databases);
  } catch (error) {
    console.error('Error fetching databases:', error);
    return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 });
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

    const { name, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if database already exists
    const existingDatabase = await db.database.findUnique({
      where: { name },
    });

    if (existingDatabase) {
      return NextResponse.json({ error: 'Database already exists' }, { status: 409 });
    }

    // Create database
    const database = await db.database.create({
      data: {
        name,
        username,
        password,
        sizeMB: 0,
      },
    });

    return NextResponse.json(database, { status: 201 });
  } catch (error) {
    console.error('Error creating database:', error);
    return NextResponse.json({ error: 'Failed to create database' }, { status: 500 });
  }
}
