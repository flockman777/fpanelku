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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Find domain
    const existingDomain = await db.domain.findUnique({
      where: { name: domain },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Update SSL expiry (simulate renewal)
    const newExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    await db.domain.update({
      where: { id: existingDomain.id },
      data: {
        sslEnabled: true,
        sslExpiry: newExpiry,
      },
    });

    return NextResponse.json({
      message: 'SSL renewal started',
      domain,
      newExpiry: newExpiry.toISOString(),
      status: 'pending',
      note: 'In production, this would renew the Let\'s Encrypt certificate. For demo purposes, SSL is renewed immediately.',
    });
  } catch (error) {
    console.error('Error renewing SSL:', error);
    return NextResponse.json({ error: 'Failed to renew SSL' }, { status: 500 });
  }
}
