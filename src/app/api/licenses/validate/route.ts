import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, domain, hardwareId } = await req.json();

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      );
    }

    // Find license
    const license = await db.license.findUnique({
      where: { licenseKey },
      include: { user: true },
    });

    if (!license) {
      return NextResponse.json(
        { error: 'Invalid license key' },
        { status: 404 }
      );
    }

    // Check status
    if (license.status === 'suspended') {
      return NextResponse.json(
        { error: 'License is suspended' },
        { status: 403 }
      );
    }

    // Check expiry
    if (license.expiresAt && new Date() > license.expiresAt) {
      // Check grace period
      if (license.gracePeriodEnd && new Date() > license.gracePeriodEnd) {
        return NextResponse.json(
          { error: 'License has expired' },
          { status: 403 }
        );
      }
    }

    // Validate domain
    if (license.domain && domain !== license.domain) {
      return NextResponse.json(
        { error: 'License does not match domain' },
        { status: 403 }
      );
    }

    // Validate hardware ID
    if (license.hardwareId && hardwareId !== license.hardwareId) {
      return NextResponse.json(
        { error: 'License does not match hardware' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      license: {
        id: license.id,
        tier: license.tier,
        maxServers: license.maxServers,
        maxDomains: license.maxDomains,
        maxStorageGB: license.maxStorageGB,
        expiresAt: license.expiresAt,
        status: license.status,
      },
    });
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
