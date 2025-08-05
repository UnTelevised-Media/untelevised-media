// scripts/preview-copy-posts-to-articles.js

/**
 * This script previews what posts will be copied to articles without making any changes.
 * Run this script with: node scripts/preview-copy-posts-to-articles.js
 */

const { createClient } = require('@sanity/client');
const path = require('path');

// Load environment variables from multiple possible locations
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Sanity client (read-only)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-06-04',
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function previewCopyOperation() {
  console.log('👀 PREVIEW: Post-to-Article Copy Operation');
  console.log('⚠️  This is a preview only - no changes will be made\n');

  try {
    // Fetch posts and articles
    console.log('📋 Fetching posts and articles...');
    
    const posts = await client.fetch(`
      *[_type == "post"] | order(_createdAt desc) {
        _id,
        title,
        slug,
        _createdAt,
        publishedAt,
        author->{name}
      }
    `);

    const existingArticles = await client.fetch(`
      *[_type == "article"] {
        title,
        slug,
        _createdAt
      }
    `);

    if (posts.length === 0) {
      console.log('✅ No posts found in the dataset.');
      return;
    }

    console.log(`📊 Dataset Overview:`);
    console.log(`   Posts found: ${posts.length}`);
    console.log(`   Existing articles: ${existingArticles.length}\n`);

    // Analyze what will happen
    let willCopy = 0;
    let willSkip = 0;
    const copyList = [];
    const skipList = [];

    posts.forEach((post) => {
      const existingArticle = existingArticles.find(
        article => article.title === post.title || article.slug?.current === post.slug?.current
      );

      if (existingArticle) {
        willSkip++;
        skipList.push({
          title: post.title,
          reason: 'Similar article already exists',
          slug: post.slug?.current
        });
      } else {
        willCopy++;
        copyList.push({
          title: post.title,
          slug: post.slug?.current,
          author: post.author?.name || 'Unknown',
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published',
          createdAt: new Date(post._createdAt).toLocaleDateString()
        });
      }
    });

    // Display results
    console.log('📈 Copy Operation Summary:');
    console.log(`   ✅ Will copy: ${willCopy} posts`);
    console.log(`   ⚠️  Will skip: ${willSkip} posts`);
    console.log(`   📊 Total posts: ${posts.length}\n`);

    if (copyList.length > 0) {
      console.log('✅ Posts that WILL BE COPIED:');
      copyList.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.title}"`);
        console.log(`      Slug: ${post.slug || 'No slug'}`);
        console.log(`      Author: ${post.author}`);
        console.log(`      Published: ${post.publishedAt}`);
        console.log(`      Created: ${post.createdAt}\n`);
      });
    }

    if (skipList.length > 0) {
      console.log('⚠️  Posts that WILL BE SKIPPED:');
      skipList.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.title}"`);
        console.log(`      Reason: ${post.reason}`);
        console.log(`      Slug: ${post.slug || 'No slug'}\n`);
      });
    }

    console.log('🎯 Next Steps:');
    if (willCopy > 0) {
      console.log('   1. Run: npm run copy:posts-to-articles');
      console.log('   2. Or run: node scripts/copy-posts-to-articles.js');
    } else {
      console.log('   No action needed - all posts already have corresponding articles.');
    }

  } catch (error) {
    console.error('❌ Preview failed:', error);
    
    if (error.message.includes('Insufficient permissions')) {
      console.log('\n💡 Tip: Make sure your SANITY_API_READ_TOKEN or SANITY_API_WRITE_TOKEN has read permissions.');
    }
    
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking environment...');

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required');
    }

    if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
      throw new Error('NEXT_PUBLIC_SANITY_DATASET is required');
    }

    if (!process.env.SANITY_API_READ_TOKEN && !process.env.SANITY_API_WRITE_TOKEN) {
      throw new Error('SANITY_API_READ_TOKEN or SANITY_API_WRITE_TOKEN is required');
    }

    console.log('✅ Environment check passed.\n');

    await previewCopyOperation();

  } catch (error) {
    console.error('💥 Preview failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  previewCopyOperation,
};
