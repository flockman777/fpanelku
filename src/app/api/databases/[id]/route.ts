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

    const database = await db.database.findUnique({
      where: { id: params.id },
    });

    if (!database) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    return NextResponse.json(database);
  } catch (error) {
    console.error('Error fetching database:', error);
    return NextResponse.json({ error: 'Failed to fetch database' }, { status: 500 });
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

    const { name, username, password } = await req.json();

    // Check if database exists
    const existingDatabase = await db.database.findUnique({
      where: { id: params.id },
    });

    if (!existingDatabase) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    // Check if new name conflicts with another database
    if (name && name !== existingDatabase.name) {
      const nameConflict = await db.database.findUnique({
        where: { name },
      });

      if (nameConflict) {
        return NextResponse.json({ error: 'Database name already exists' }, { status: 409 });
      }
    }

    // Update database
    const database = await db.database.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(password !== undefined && { password }),
      },
    });

    return NextResponse.json(database);
  } catch (error) {
    console.error('Error updating database:', error);
    return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
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

    // Check if database exists
    const existingDatabase = await db.database.findUnique({
      where: { id: params.id },
    });

    if (!existingDatabase) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    // Delete database
    await db.database.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Database deleted successfully' });
  } catch (error) {
    console.error('Error deleting database:', error);
    return NextResponse.json({ error: 'Failed to delete database' }, { status: 500 });
  }
}
