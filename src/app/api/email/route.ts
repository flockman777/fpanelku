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

    const emails = await db.email.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
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

    const { email, password, quota, forwardTo, autoReply } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.email.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Create email account
    const newEmail = await db.email.create({
      data: {
        email,
        password,
        quota: quota || 1024,
        used: 0,
        forwardTo: forwardTo || null,
        autoReply: autoReply || null,
      },
    });

    return NextResponse.json(newEmail, { status: 201 });
  } catch (error) {
    console.error('Error creating email:', error);
    return NextResponse.json({ error: 'Failed to create email' }, { status: 500 });
  }
}
