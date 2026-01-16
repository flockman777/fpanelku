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

async function deleteRecursive(dirPath: string) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await deleteRecursive(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    }

    await fs.rmdir(dirPath);
  } catch (error) {
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path: requestedPath } = await req.json();

    if (!requestedPath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const safePath = sanitizePath(requestedPath);

    try {
      const stats = await fs.stat(safePath);

      if (stats.isDirectory()) {
        // Recursive delete for directories
        await deleteRecursive(safePath);
      } else {
        // Simple delete for files
        await fs.unlink(safePath);
      }

      return NextResponse.json({
        message: 'Deleted successfully',
        path: safePath,
      });
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json({ error: 'Path not found' }, { status: 404 });
      }
      console.error('Error deleting:', error);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in delete operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
