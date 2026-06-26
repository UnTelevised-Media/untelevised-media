#!/usr/bin/env node

/**
 * Docker build and push script
 * Builds a fresh Docker image with --no-cache and --pull
 * Tags as 'latest' and pushes to Docker Hub
 * Usage: node scripts/docker-build.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐳 BUILDING FRESH DOCKER IMAGE...\n');

// Load .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('📝 Loading environment from .env.local...');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Handle quoted values
      if (key && !process.env[key]) {
        // Only set if not already in process.env (process.env takes precedence)
        process.env[key] = value;
      }
    }
  });
  console.log('✓ Environment loaded\n');
} else {
  console.log('⚠️  No .env.local found, using process.env variables\n');
}

// Build arguments - load from environment or use defaults
const buildArgs = {
  NEXT_PUBLIC_PRODUCTION_URL: process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://www.untelevised.media',
  NEXT_PUBLIC_DEVELOPMENT_URL: process.env.NEXT_PUBLIC_DEVELOPMENT_URL || 'http://localhost:3000',
  NEXT_PUBLIC_METADATA_BASE_URL: process.env.NEXT_PUBLIC_METADATA_BASE_URL || 'https://www.untelevised.media/',
  BASEURL: process.env.BASEURL || 'https://www.untelevised.media/',
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ypejdt32',
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'articles',
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04',
  NEXT_PUBLIC_SANITY_PROJECT_TITLE: process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'UnTelevised Media',
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID || 'G-WFZF996PSN',
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5S6L6KDH',
  NEXT_PUBLIC_GAS_ID: process.env.NEXT_PUBLIC_GAS_ID || 'ca-pub-7412827340538951',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'ZJPNDOBRD8',
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '0509bb2269843dc8bb8887e702c1ff6c',
  NEXT_PUBLIC_CORAL_URL: process.env.NEXT_PUBLIC_CORAL_URL || 'https://coral.untelevised.media',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tewnvjowrdfzvqcsfwgx.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_MEMBERSHIP_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_MEMBERSHIP_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ORG: process.env.SENTRY_ORG || 'untelevised-media',
  SENTRY_PROJECT: process.env.SENTRY_PROJECT || 'untelevised-media',
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_MEMBERSHIP_SECRET_KEY: process.env.STRIPE_MEMBERSHIP_SECRET_KEY,
  SUPABASE_MEMBERSHIP_URL: process.env.SUPABASE_MEMBERSHIP_URL || 'https://tewnvjowrdfzvqcsfwgx.supabase.co',
  SUPABASE_MEMBERSHIP_SERVICE_ROLE_KEY: process.env.SUPABASE_MEMBERSHIP_SERVICE_ROLE_KEY,
};

// Validate critical environment variables before building
const criticalVars = [
  'SANITY_API_READ_TOKEN',
  'SANITY_API_WRITE_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_MEMBERSHIP_SECRET_KEY',
  'SENTRY_AUTH_TOKEN',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_STRIPE_MEMBERSHIP_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SENTRY_DSN',
  'SUPABASE_MEMBERSHIP_SERVICE_ROLE_KEY',
];

const missingVars = criticalVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ Missing critical environment variables:');
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error('\nAdd these to .env.local and try again.\n');
  process.exit(1);
}

// Build command with all args
const buildCmd = [
  'docker build',
  '--no-cache',
  '--pull',
  ...Object.entries(buildArgs)
    .filter(([, v]) => v) // Skip undefined values
    .map(([k, v]) => `--build-arg ${k}="${v}"`),
  '-t untelevisedmedia/untelevised-media:latest',
  '.',
].join(' ');

try {
  console.log('📦 Building fresh image (tagged as "latest")...\n');
  execSync(buildCmd, { stdio: 'inherit', cwd: process.cwd() });

  console.log('\n✅ Build successful!\n');

  // Prompt for push
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🚀 Push to Docker Hub now? (y/n): ', (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'y') {
      console.log('\n📤 Pushing to Docker Hub...\n');
      try {
        execSync('docker push untelevisedmedia/untelevised-media:latest', {
          stdio: 'inherit',
        });
        console.log('\n✅ Image pushed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Go to Coolify → redeploy your service');
        console.log('   2. Hard refresh browser (Ctrl+Shift+R) once deployed\n');
      } catch (error) {
        console.error('❌ Error pushing to Docker Hub:', error.message);
        process.exit(1);
      }
    } else {
      console.log('\n⏭️  Push skipped. Image is ready locally as "latest".');
      console.log('    Run: docker push untelevisedmedia/untelevised-media:latest\n');
    }
  });
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
