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

    const ftpUser = await db.fTPUser.findUnique({
      where: { id: params.id },
    });

    if (!ftpUser) {
      return NextResponse.json({ error: 'FTP user not found' }, { status: 404 });
    }

    return NextResponse.json(ftpUser);
  } catch (error) {
    console.error('Error fetching FTP user:', error);
    return NextResponse.json({ error: 'Failed to fetch FTP user' }, { status: 500 });
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

    const { username, password, homePath, quota } = await req.json();

    // Check if user exists
    const existingUser = await db.fTPUser.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'FTP user not found' }, { status: 404 });
    }

    // Check if new username conflicts with another
    if (username && username !== existingUser.username) {
      const usernameConflict = await db.fTPUser.findUnique({
        where: { username },
      });

      if (usernameConflict) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }

    // Update FTP user
    const updatedUser = await db.fTPUser.update({
      where: { id: params.id },
      data: {
        ...(username && { username }),
        ...(password && { password }),
        ...(homePath !== undefined && { homePath }),
        ...(quota !== undefined && { quota }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating FTP user:', error);
    return NextResponse.json({ error: 'Failed to update FTP user' }, { status: 500 });
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

    // Check if user exists
    const existingUser = await db.fTPUser.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'FTP user not found' }, { status: 404 });
    }

    // Delete FTP user
    await db.fTPUser.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'FTP user deleted successfully' });
  } catch (error) {
    console.error('Error deleting FTP user:', error);
    return NextResponse.json({ error: 'Failed to delete FTP user' }, { status: 500 });
  }
}
