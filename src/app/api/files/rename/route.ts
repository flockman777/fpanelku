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

    const { oldPath, newName } = await req.json();

    if (!oldPath || !newName) {
      return NextResponse.json(
        { error: 'Old path and new name are required' },
        { status: 400 }
      );
    }

    // Validate new name
    if (!/^[a-zA-Z0-9_\-\.\s]+$/.test(newName)) {
      return NextResponse.json(
        { error: 'Invalid name. Only letters, numbers, spaces, hyphens, underscores, and dots are allowed.' },
        { status: 400 }
      );
    }

    const safeOldPath = sanitizePath(oldPath);
    const dirPath = path.dirname(safeOldPath);
    const newSafePath = path.join(dirPath, newName);

    try {
      // Check if old path exists
      await fs.access(safeOldPath);

      // Check if new name already exists
      try {
        await fs.access(newSafePath);
        return NextResponse.json({ error: 'Target name already exists' }, { status: 409 });
      } catch {
        // Target doesn't exist, proceed with rename
      }

      // Rename
      await fs.rename(safeOldPath, newSafePath);

      return NextResponse.json({
        message: 'Renamed successfully',
        oldPath: safeOldPath,
        newPath: newSafePath,
      });
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json({ error: 'Source path not found' }, { status: 404 });
      }
      console.error('Error renaming:', error);
      return NextResponse.json({ error: 'Failed to rename' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in rename operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
