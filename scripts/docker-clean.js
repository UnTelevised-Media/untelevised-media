#!/usr/bin/env node

/**
 * Docker and Next.js build cache cleaner
 * Removes all traces of old builds before fresh Docker build
 * Usage: node scripts/docker-clean.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 PURGING ALL BUILD CACHES...\n');

try {
  // Step 1: Delete Next.js build artifacts
  console.log('📦 Cleaning Next.js builds...');
  const nextDirs = ['.next', 'out', 'node_modules/.cache'];
  nextDirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      console.log(`  ✓ Deleted ${dir}`);
    }
  });

  // Step 2: Remove all untelevised-media Docker images
  console.log('\n🐳 Removing all untelevised-media Docker images...');
  try {
    const images = execSync('docker images -q untelevisedmedia/untelevised-media', {
      encoding: 'utf-8',
    }).trim();
    if (images) {
      execSync(`docker rmi -f ${images}`, { stdio: 'inherit' });
      console.log('  ✓ Removed all untelevised-media images');
    } else {
      console.log('  ℹ No images to remove');
    }
  } catch (e) {
    console.log('  ℹ No images found or Docker not running');
  }

  // Step 3: Prune Docker build cache
  console.log('\n🧹 Pruning Docker build cache...');
  try {
    execSync('docker buildx prune -af', { stdio: 'inherit' });
    console.log('  ✓ Build cache pruned');
  } catch (e) {
    console.log('  ℹ Could not prune buildx cache (may not be available)');
  }

  // Step 4: System prune
  console.log('\n🧹 Running Docker system prune...');
  try {
    execSync('docker system prune -f', { stdio: 'inherit' });
    console.log('  ✓ System cleaned');
  } catch (e) {
    console.log('  ℹ Docker not available');
  }

  console.log('\n✅ All caches purged! Ready for fresh build.\n');
} catch (error) {
  console.error('\n❌ Error during cleanup:', error.message);
  process.exit(1);
}
