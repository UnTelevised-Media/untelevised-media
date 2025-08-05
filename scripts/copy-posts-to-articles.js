// scripts/copy-posts-to-articles.js

/**
 * This script copies all documents of type 'post' to type 'article' in Sanity.
 * The original posts will remain unchanged.
 * Run this script with: node scripts/copy-posts-to-articles.js
 *
 * Make sure to:
 * 1. Backup your dataset before running this script
 * 2. Set your environment variables (SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN)
 * 3. Have the new 'article' schema deployed to Sanity Studio
 */

const { createClient } = require('@sanity/client');
const path = require('path');

// Load environment variables from multiple possible locations
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Debug: Log the environment variables (without showing the token)
console.log('🔍 Environment variables:');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? '✅ Found' : '❌ Missing');
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET ? '✅ Found' : '❌ Missing');
console.log('Write Token:', process.env.SANITY_API_WRITE_TOKEN ? '✅ Found' : '❌ Missing');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-06-04',
  token: process.env.SANITY_API_WRITE_TOKEN, // Use the correct token name
  useCdn: false,
});

async function copyPostsToArticles() {
  console.log('🚀 Starting copy from "post" to "article"...');
  console.log('📝 Note: Original posts will remain unchanged');

  try {
    // Step 1: Fetch all documents of type 'post'
    console.log('📋 Fetching all posts...');
    const posts = await client.fetch('*[_type == "post"]');

    if (posts.length === 0) {
      console.log('✅ No posts found to copy.');
      return;
    }

    console.log(`📊 Found ${posts.length} posts to copy.`);

    // Step 2: Check if articles already exist to avoid duplicates
    console.log('🔍 Checking for existing articles...');
    const existingArticles = await client.fetch('*[_type == "article"]');
    console.log(`📊 Found ${existingArticles.length} existing articles.`);

    // Step 3: Create copy operations
    const mutations = [];
    let skippedCount = 0;

    for (const post of posts) {
      // Generate new ID for the article
      const newArticleId = `article-${post._id.replace(/^(drafts\.)?post-?/, '')}`;
      
      // Check if article with similar content already exists
      const existingArticle = existingArticles.find(
        article => article.title === post.title || article.slug?.current === post.slug?.current
      );

      if (existingArticle) {
        console.log(`⚠️ Skipping "${post.title}" - similar article already exists`);
        skippedCount++;
        continue;
      }

      // Create new article document
      const articleDoc = {
        ...post,
        _type: 'article',
        _id: newArticleId,
      };

      // Remove system fields that shouldn't be copied
      delete articleDoc._rev;
      delete articleDoc._createdAt;
      delete articleDoc._updatedAt;

      // Create mutation
      mutations.push({
        create: articleDoc
      });
    }

    if (mutations.length === 0) {
      console.log('✅ No new articles to create. All posts already have corresponding articles.');
      return;
    }

    console.log(`📝 Will create ${mutations.length} new articles (${skippedCount} skipped)`);

    // Step 4: Execute copy operations in batches
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < mutations.length; i += batchSize) {
      batches.push(mutations.slice(i, i + batchSize));
    }

    console.log(`🔄 Processing ${batches.length} batches...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processing batch ${i + 1}/${batches.length}...`);

      const transaction = client.transaction();
      batch.forEach((mutation) => {
        transaction.create(mutation.create);
      });

      await transaction.commit();
      console.log(`✅ Batch ${i + 1} completed.`);
    }

    console.log('🎉 Copy operation completed successfully!');
    console.log(`📈 Created ${mutations.length} new articles from posts.`);
    console.log(`📝 Original ${posts.length} posts remain unchanged.`);

  } catch (error) {
    console.error('❌ Copy operation failed:', error);
    throw error;
  }
}

// Utility function to backup dataset
async function backupDataset() {
  console.log('💾 Creating backup...');

  try {
    const allDocuments = await client.fetch('*');
    const fs = require('fs');
    const path = require('path');

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    fs.writeFileSync(backupFile, JSON.stringify(allDocuments, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);

    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Function to preview what will be copied
async function previewCopy() {
  console.log('👀 Preview: What will be copied...');

  try {
    const posts = await client.fetch('*[_type == "post"]{_id, title, slug, _createdAt}');
    const existingArticles = await client.fetch('*[_type == "article"]{title, slug}');

    if (posts.length === 0) {
      console.log('✅ No posts found to copy.');
      return;
    }

    console.log(`\n📊 Found ${posts.length} posts:`);
    
    let willCopy = 0;
    let willSkip = 0;

    posts.forEach((post, index) => {
      const existingArticle = existingArticles.find(
        article => article.title === post.title || article.slug?.current === post.slug?.current
      );

      if (existingArticle) {
        console.log(`${index + 1}. ⚠️ "${post.title}" - WILL SKIP (similar article exists)`);
        willSkip++;
      } else {
        console.log(`${index + 1}. ✅ "${post.title}" - WILL COPY`);
        willCopy++;
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`   Will copy: ${willCopy} posts`);
    console.log(`   Will skip: ${willSkip} posts`);
    console.log(`   Total posts: ${posts.length}`);

  } catch (error) {
    console.error('❌ Preview failed:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  try {
    console.log('🔍 Checking environment...');

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required');
    }

    if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
      throw new Error('NEXT_PUBLIC_SANITY_DATASET is required');
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      throw new Error('SANITY_API_WRITE_TOKEN is required');
    }

    console.log('✅ Environment check passed.');

    // Show preview first
    await previewCopy();

    // Ask user for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(
      '\nDo you want to proceed with copying posts to articles? (y/N): ',
      async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          // Create backup
          await backupDataset();
          
          // Run copy operation
          await copyPostsToArticles();
          
          console.log('🎯 Copy process completed!');
          console.log('📝 Next steps:');
          console.log('   1. Check your Sanity Studio to verify the articles were created');
          console.log('   2. Test your application thoroughly');
          console.log('   3. Update any code that references posts to also handle articles');
        } else {
          console.log('❌ Copy operation cancelled.');
        }

        readline.close();
        process.exit(0);
      }
    );
  } catch (error) {
    console.error('💥 Copy process failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  copyPostsToArticles,
  backupDataset,
  previewCopy,
};
