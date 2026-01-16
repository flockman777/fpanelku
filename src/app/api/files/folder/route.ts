import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
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

const BASE_DIR = process.env.FILE_MANAGER_DIR || '/opt/fpanel/files';

function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath);
  const resolved = path.resolve(BASE_DIR, normalized.replace(/^\//, ''));
  if (!resolved.startsWith(BASE_DIR)) {
    return BASE_DIR;
  }
  return resolved;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path: requestedPath, name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Validate folder name
    if (!/^[a-zA-Z0-9_\-\s\.]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Invalid folder name. Only letters, numbers, spaces, hyphens, underscores, and dots are allowed.' },
        { status: 400 }
      );
    }

    const safePath = sanitizePath(requestedPath);
    const newFolderPath = path.join(safePath, name);

    try {
      // Check if folder already exists
      await fs.access(newFolderPath);
      return NextResponse.json({ error: 'Folder already exists' }, { status: 409 });
    } catch {
      // Folder doesn't exist, proceed with creation
    }

    try {
      await fs.mkdir(newFolderPath, { recursive: true });
      return NextResponse.json({
        message: 'Folder created successfully',
        path: newFolderPath,
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in folder creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
