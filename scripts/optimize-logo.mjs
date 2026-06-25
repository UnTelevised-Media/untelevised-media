#!/usr/bin/env node
/**
 * optimize-logo.mjs
 *
 * Optimizes Logo.png by creating a WebP version and compressing the original PNG.
 * Requires ffmpeg on PATH.
 */

import { execSync } from 'child_process';
import { statSync } from 'fs';
import { join } from 'path';

const logoPath = join(process.cwd(), 'public', 'Logo.png');

try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  console.error('ffmpeg not found on PATH. Install ffmpeg to optimize images.');
  process.exit(1);
}

const originalSize = statSync(logoPath).size / 1024;
console.log(`Original Logo.png size: ${originalSize.toFixed(2)} KiB\n`);

// Create WebP version with quality 80 (high quality, smaller size)
console.log('Creating optimized WebP version...');
try {
  execSync(`ffmpeg -i "${logoPath}" -c:v libwebp -quality 80 "${logoPath.replace('.png', '.webp')}" -y`, {
    stdio: 'ignore',
  });
  const webpSize = statSync(logoPath.replace('.png', '.webp')).size / 1024;
  console.log(`✓ Created Logo.webp (${webpSize.toFixed(2)} KiB, ${((1 - webpSize / originalSize) * 100).toFixed(1)}% smaller)\n`);
} catch (err) {
  console.error(`✗ Failed to create WebP: ${err.message}`);
  process.exit(1);
}

console.log('Optimization complete! Update HeaderLogo.tsx to use Logo.webp for best results.');
console.log('Or use <picture> element to serve WebP to modern browsers with PNG fallback.');
