import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function generateIcons() {
  // Create icons directory if it doesn't exist
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  await fs.mkdir(iconsDir, { recursive: true });

  // Use an existing image as source (e.g., logo or placeholder)
  const sourceImage = path.join(process.cwd(), 'public', 'placeholders', 'landscape-placeholder.svg');

  // Generate 192x192 icon
  await sharp(sourceImage)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));

  // Generate 512x512 icon
  await sharp(sourceImage)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));

  console.log('PWA icons generated successfully!');
}

generateIcons().catch(console.error); 