import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { UPLOAD_DIR } from '@/lib/upload';

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  
  // SANITIZATION: Prevent Path Traversal
  const safeFilename = require('path').basename(filename);
  const filePath = join(UPLOAD_DIR, safeFilename);
  
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return new NextResponse('Not found', { status: 404 });
    
    const file = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    let mime = 'application/octet-stream';
    if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
    else if (ext === 'png') mime = 'image/png';
    else if (ext === 'gif') mime = 'image/gif';
    else if (ext === 'webp') mime = 'image/webp';
    else if (ext === 'pdf') mime = 'application/pdf';
    else if (ext === 'svg') mime = 'image/svg+xml';
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Not found', { status: 404 });
  }
}
