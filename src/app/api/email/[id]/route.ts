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

    const email = await db.email.findUnique({
      where: { id: params.id },
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json(email);
  } catch (error) {
    console.error('Error fetching email:', error);
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 500 });
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

    const { email, password, quota, forwardTo, autoReply } = await req.json();

    // Check if email exists
    const existingEmail = await db.email.findUnique({
      where: { id: params.id },
    });

    if (!existingEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Check if new email conflicts with another
    if (email && email !== existingEmail.email) {
      const emailConflict = await db.email.findUnique({
        where: { email },
      });

      if (emailConflict) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }

    // Update email
    const updatedEmail = await db.email.update({
      where: { id: params.id },
      data: {
        ...(email && { email }),
        ...(password && { password }),
        ...(quota !== undefined && { quota }),
        ...(forwardTo !== undefined && { forwardTo }),
        ...(autoReply !== undefined && { autoReply }),
      },
    });

    return NextResponse.json(updatedEmail);
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
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

    // Check if email exists
    const existingEmail = await db.email.findUnique({
      where: { id: params.id },
    });

    if (!existingEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Delete email
    await db.email.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Email account deleted successfully' });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
  }
}
