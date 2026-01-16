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

// Base directory for file operations
const BASE_DIR = process.env.FILE_MANAGER_DIR || '/opt/fpanel/files';

// Ensure base directory exists
async function ensureBaseDir() {
  try {
    await fs.access(BASE_DIR);
  } catch {
    await fs.mkdir(BASE_DIR, { recursive: true });
  }
}

// Sanitize path to prevent directory traversal
function sanitizePath(inputPath: string): string {
  const normalized = path.normalize(inputPath);
  const resolved = path.resolve(BASE_DIR, normalized.replace(/^\//, ''));
  if (!resolved.startsWith(BASE_DIR)) {
    return BASE_DIR;
  }
  return resolved;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureBaseDir();

    const { searchParams } = new URL(req.url);
    const requestedPath = searchParams.get('path') || '/';

    const safePath = sanitizePath(requestedPath);

    try {
      const entries = await fs.readdir(safePath, { withFileTypes: true });

      const items = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(safePath, entry.name);
          const stats = await fs.stat(fullPath);

          return {
            name: entry.name,
            path: path.join(requestedPath, entry.name),
            size: stats.size,
            type: entry.isDirectory() ? 'directory' : 'file',
            modified: stats.mtime.toISOString(),
          };
        })
      );

      // Sort: directories first, then files, both alphabetically
      items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return NextResponse.json(items);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
