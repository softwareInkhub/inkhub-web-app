import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

async function createPlaceholderImage() {
  // Create a 1920x1080 gray SVG
  const svg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="40" fill="#9ca3af" text-anchor="middle">
        Placeholder Image
      </text>
    </svg>
  `;

  const uploadDir = path.join(process.cwd(), 'public', 'placeholders');
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, 'landscape-placeholder.svg');
  await writeFile(filePath, svg);
}

export async function GET() {
  try {
    await createPlaceholderImage();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating placeholder:', error);
    return NextResponse.json({ error: 'Failed to create placeholder' }, { status: 500 });
  }
} 