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

    const { domain, email } = await req.json();

    if (!domain || !email) {
      return NextResponse.json(
        { error: 'Domain and email are required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain exists
    const existingDomain = await db.domain.findUnique({
      where: { name: domain },
    });

    // If domain doesn't exist in DB, create it
    if (!existingDomain) {
      await db.domain.create({
        data: {
          name: domain,
          sslEnabled: true,
          sslExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        },
      });
    } else {
      // Update existing domain
      await db.domain.update({
        where: { id: existingDomain.id },
        data: {
          sslEnabled: true,
          sslExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // In production, this would actually call certbot or Let's Encrypt API
    // For now, we're simulating the installation

    return NextResponse.json({
      message: 'SSL certificate installation started',
      domain,
      status: 'pending',
      note: 'In production, this would install Let\'s Encrypt SSL using certbot. For demo purposes, SSL is enabled immediately.',
    });
  } catch (error) {
    console.error('Error installing SSL:', error);
    return NextResponse.json({ error: 'Failed to install SSL' }, { status: 500 });
  }
}
