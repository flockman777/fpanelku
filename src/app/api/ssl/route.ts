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

// Mock SSL certificates data (in production, this would come from Let's Encrypt)
async function getMockSSLCertificates() {
  const domains = await db.domain.findMany();

  return domains.map((domain) => {
    if (!domain.sslEnabled || !domain.sslExpiry) {
      return {
        domain: domain.name,
        status: 'none' as const,
        issuer: '-',
        validFrom: '-',
        validTo: '-',
        daysRemaining: 0,
      };
    }

    const validTo = new Date(domain.sslExpiry);
    const now = new Date();
    const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      domain: domain.name,
      status: daysRemaining <= 0 ? 'expired' as const : 'active' as const,
      issuer: "Let's Encrypt Authority X3",
      validFrom: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      validTo: validTo.toISOString(),
      daysRemaining,
    };
  });
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const certificates = await getMockSSLCertificates();
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error fetching SSL certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch SSL certificates' }, { status: 500 });
  }
}
