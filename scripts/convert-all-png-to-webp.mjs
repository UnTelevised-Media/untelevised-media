#!/usr/bin/env node
/**
 * convert-all-png-to-webp.mjs
 *
 * Recursively converts all PNG files in the public directory to WebP format.
 * Preserves the original PNG files (doesn't delete them).
 *
 * Usage:
 *   node scripts/convert-all-png-to-webp.mjs
 *   pnpm convert:all-webp
 *
 * Requires ffmpeg on PATH.
 */

import { readdirSync, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { execSync } from 'child_process';

const PUBLIC_FOLDER = './public';
const QUALITY = 85;

// Verify ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  console.error('ffmpeg not found on PATH. Install it and try again.');
  process.exit(1);
}

// Recursively find all PNG files
function findPngFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findPngFiles(fullPath, files);
    } else if (extname(item).toLowerCase() === '.png') {
      files.push(fullPath);
    }
  }

  return files;
}

const pngFiles = findPngFiles(PUBLIC_FOLDER);

if (pngFiles.length === 0) {
  console.log('No PNG files found in ' + PUBLIC_FOLDER);
  process.exit(0);
}

console.log(`Found ${pngFiles.length} PNG file(s) in ${PUBLIC_FOLDER}\n`);

let converted = 0;
let failed = 0;
const webpFiles = [];

for (const inputPath of pngFiles) {
  const outputPath = inputPath.replace(/\.png$/i, '.webp');
  const filename = inputPath.replace(PUBLIC_FOLDER, '').slice(1);

  process.stdout.write(`Converting: ${filename} → ${filename.replace(/\.png$/i, '.webp')} ... `);

  try {
    execSync(`ffmpeg -i "${inputPath}" -c:v libwebp -quality ${QUALITY} "${outputPath}" -y`, {
      stdio: 'ignore',
    });

    if (!existsSync(outputPath)) {
      throw new Error('Output file was not created');
    }

    webpFiles.push(outputPath);
    console.log('✓');
    converted++;
  } catch (err) {
    console.log(`✗ FAILED (${err.message})`);
    failed++;
  }
}

console.log(`\n✓ Converted ${converted} PNG file(s) to WebP`);
if (failed > 0) {
  console.log(`✗ Failed: ${failed}`);
  process.exit(1);
}

console.log('\nWebP files created:');
webpFiles.forEach(file => {
  const stat = statSync(file);
  const sizeKB = (stat.size / 1024).toFixed(2);
  console.log(`  • ${file.replace(PUBLIC_FOLDER, '').slice(1)} (${sizeKB} KiB)`);
});

console.log('\n📋 Next steps:');
console.log('1. Update all references in the codebase:');
console.log('   - Find all imports/references to *.png files');
console.log('   - Replace with *.webp equivalents');
console.log('2. Keep original PNG files as fallback for older browsers');
console.log('3. Use <picture> element or Next.js Image optimization for format negotiation');
