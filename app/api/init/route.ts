import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

async function createPlaceholderImages() {
  const placeholdersDir = path.join(process.cwd(), 'public', 'placeholders');
  await mkdir(placeholdersDir, { recursive: true });

  // Create landscape placeholder
  const landscapeSvg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="40" fill="#9ca3af" text-anchor="middle">
        Placeholder Image
      </text>
    </svg>
  `;

  await writeFile(
    path.join(placeholdersDir, 'landscape-placeholder.svg'),
    landscapeSvg.trim()
  );
}

export async function GET() {
  try {
    await createPlaceholderImages();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating placeholders:', error);
    return NextResponse.json(
      { error: 'Failed to create placeholders' },
      { status: 500 }
    );
  }
} 