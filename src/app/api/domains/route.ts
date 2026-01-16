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

    const domains = await db.domain.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
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

    const { name, path } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    // Check if domain already exists
    const existingDomain = await db.domain.findUnique({
      where: { name },
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 409 });
    }

    // Create domain
    const domain = await db.domain.create({
      data: {
        name,
        path: path || null,
        sslEnabled: false,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error('Error creating domain:', error);
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
  }
}
