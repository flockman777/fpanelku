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
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

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

    const formData = await req.formData();
    const requestedPath = formData.get('path') as string || '/';
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const safePath = sanitizePath(requestedPath);

    // Ensure target directory exists
    try {
      await fs.access(safePath);
    } catch {
      await fs.mkdir(safePath, { recursive: true });
    }

    const uploadedFiles: string[] = [];
    const errors: { file: string; error: string }[] = [];

    for (const file of files) {
      try {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            file: file.name,
            error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          });
          continue;
        }

        // Validate file name
        if (!/^[a-zA-Z0-9_\-\.\s]+$/.test(file.name)) {
          errors.push({
            file: file.name,
            error: 'Invalid file name',
          });
          continue;
        }

        const filePath = path.join(safePath, file.name);

        // Write file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        uploadedFiles.push(file.name);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push({
          file: file.name,
          error: 'Failed to upload',
        });
      }
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      uploaded: uploadedFiles,
      errors: errors,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
