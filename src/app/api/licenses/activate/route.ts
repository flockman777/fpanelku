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
    });

    if (!license) {
      return NextResponse.json(
        { error: 'Invalid license key' },
        { status: 404 }
      );
    }

    // Check if already activated
    if (license.activatedAt) {
      return NextResponse.json(
        { error: 'License is already activated' },
        { status: 400 }
      );
    }

    // Update license with activation details
    const updatedLicense = await db.license.update({
      where: { id: license.id },
      data: {
        domain,
        hardwareId,
        activatedAt: new Date(),
        status: 'active',
      },
    });

    return NextResponse.json({
      message: 'License activated successfully',
      license: updatedLicense,
    });
  } catch (error) {
    console.error('License activation error:', error);
    return NextResponse.json(
      { error: 'Activation failed' },
      { status: 500 }
    );
  }
}
