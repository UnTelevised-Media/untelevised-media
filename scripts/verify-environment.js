// scripts/verify-environment.js

/**
 * This script verifies that your environment is properly configured for the migration.
 * Run this script with: node scripts/verify-environment.js
 */

const { createClient } = require('@sanity/client');
const path = require('path');

// Load environment variables from multiple possible locations
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function verifyEnvironment() {
  console.log('🔍 Verifying environment configuration...\n');

  // Check environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'SANITY_API_WRITE_TOKEN',
  ];

  let allVarsPresent = true;

  console.log('📋 Environment Variables:');
  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('TOKEN') ? '***HIDDEN***' : value}`);
    } else {
      console.log(`  ❌ ${varName}: Missing`);
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    console.log('\n❌ Some required environment variables are missing.');
    console.log('Please check your .env.local or .env file.');
    process.exit(1);
  }

  // Test Sanity connection
  console.log('\n🔗 Testing Sanity connection...');

  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: '2025-06-04',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Test read access
    const testQuery = await client.fetch('*[0..0]');
    console.log('  ✅ Read access: Working');

    // Test write access by creating and immediately deleting a test document
    const testDoc = await client.create({
      _type: 'test',
      title: 'Migration test document',
    });
    await client.delete(testDoc._id);
    console.log('  ✅ Write access: Working');

    // Check for existing posts
    const posts = await client.fetch('*[_type == "post"]');
    console.log(`  📊 Found ${posts.length} posts to migrate`);

    // Check for existing articles (to detect if migration already ran)
    const articles = await client.fetch('*[_type == "article"]');
    if (articles.length > 0) {
      console.log(`  ⚠️  Found ${articles.length} existing articles`);
      console.log('      This might indicate the migration has already been run.');
    }

    console.log('\n🎉 Environment verification complete!');
    console.log('✅ Your environment is ready for migration.');

    if (posts.length === 0) {
      console.log('\n⚠️  No posts found to migrate. The migration script will exit early.');
    } else {
      console.log(`\n📈 Ready to migrate ${posts.length} posts to articles.`);
      console.log('Run: npm run migrate:posts-to-articles');
    }
  } catch (error) {
    console.log('  ❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('  1. Check that your SANITY_API_WRITE_TOKEN is correct');
    console.log('  2. Verify the token has write permissions');
    console.log('  3. Ensure your project ID and dataset are correct');
    console.log('  4. Check your internet connection');
    process.exit(1);
  }
}

// Run verification
verifyEnvironment().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
