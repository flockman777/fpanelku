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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domain = await db.domain.findUnique({
      where: { id: params.id },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error fetching domain:', error);
    return NextResponse.json({ error: 'Failed to fetch domain' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, path } = await req.json();

    // Check if domain exists
    const existingDomain = await db.domain.findUnique({
      where: { id: params.id },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Check if new name conflicts with another domain
    if (name && name !== existingDomain.name) {
      const nameConflict = await db.domain.findUnique({
        where: { name },
      });

      if (nameConflict) {
        return NextResponse.json({ error: 'Domain name already exists' }, { status: 409 });
      }
    }

    // Update domain
    const domain = await db.domain.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(path !== undefined && { path }),
      },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error updating domain:', error);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if domain exists
    const existingDomain = await db.domain.findUnique({
      where: { id: params.id },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Delete domain
    await db.domain.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 });
  }
}
