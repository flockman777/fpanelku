import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function generateLicenseKey(): string {
  const parts = [
    crypto.randomBytes(3).toString('hex').toUpperCase(),
    crypto.randomBytes(3).toString('hex').toUpperCase(),
    crypto.randomBytes(3).toString('hex').toUpperCase(),
    crypto.randomBytes(3).toString('hex').toUpperCase(),
  ];
  return parts.join('-');
}

function getExpiryDate(tier: string): Date {
  const now = new Date();
  const months = tier === 'professional' ? 12 : tier === 'enterprise' ? 12 : 12;
  return new Date(now.setMonth(now.getMonth() + months));
}

function getMaxLimits(tier: string) {
  switch (tier) {
    case 'professional':
      return { maxServers: 3, maxDomains: 50, maxStorageGB: 20 };
    case 'enterprise':
      return { maxServers: 999999, maxDomains: 999999, maxStorageGB: 999999 };
    default:
      return { maxServers: 1, maxDomains: 10, maxStorageGB: 5 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, tier, domain } = await req.json();

    if (!tier || !domain) {
      return NextResponse.json(
        { error: 'Tier and domain are required' },
        { status: 400 }
      );
    }

    if (!['basic', 'professional', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid license tier' },
        { status: 400 }
      );
    }

    // Generate license key
    const licenseKey = generateLicenseKey();
    const limits = getMaxLimits(tier);
    const expiresAt = getExpiryDate(tier);

    // Create license
    const license = await db.license.create({
      data: {
        licenseKey,
        userId,
        domain,
        tier,
        maxServers: limits.maxServers,
        maxDomains: limits.maxDomains,
        maxStorageGB: limits.maxStorageGB,
        expiresAt,
        activatedAt: new Date(),
        status: 'active',
      },
    });

    return NextResponse.json({
      license,
      message: 'License created successfully',
    });
  } catch (error) {
    console.error('License generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate license' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get all licenses for user
    const licenses = await db.license.findMany({
      where: { userId: decoded.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json([], { status: 200 });
  }
}
