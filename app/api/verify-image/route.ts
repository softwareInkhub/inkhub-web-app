import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get('path');

  if (!imagePath) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), 'public', imagePath);
  const exists = existsSync(fullPath);

  return NextResponse.json({ exists });
} 