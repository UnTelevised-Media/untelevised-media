// scripts/migrate-posts-to-articles.js

/**
 * This script migrates all documents of type 'post' to type 'article' in Sanity.
 * Run this script with: node scripts/migrate-posts-to-articles.js
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

async function migratePosts() {
  console.log('🚀 Starting migration from "post" to "article"...');

  try {
    // Step 1: Fetch all documents of type 'post'
    console.log('📋 Fetching all posts...');
    const posts = await client.fetch('*[_type == "post"]');

    if (posts.length === 0) {
      console.log('✅ No posts found to migrate.');
      return;
    }

    console.log(`📊 Found ${posts.length} posts to migrate.`);

    // Step 2: Create migration transaction
    const mutations = [];

    for (const post of posts) {
      // Create new article document
      const articleDoc = {
        ...post,
        _type: 'article',
        _id: post._id.replace('drafts.', ''), // Remove draft prefix if present
      };

      // Remove the old _id to avoid conflicts
      delete articleDoc._id;

      // Create mutations
      mutations.push({
        createOrReplace: {
          ...articleDoc,
          _id: post._id.replace('post-', 'article-'), // Change ID prefix
          _type: 'article',
        },
      });
    }

    // Step 3: Execute migration in batches
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
        transaction.createOrReplace(mutation.createOrReplace);
      });

      await transaction.commit();
      console.log(`✅ Batch ${i + 1} completed.`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📈 Migrated ${posts.length} posts to articles.`);

    // Step 4: Update references (optional - you might want to run this separately)
    console.log('🔗 Updating references...');
    await updateReferences();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function updateReferences() {
  try {
    // Update live events that reference posts
    const liveEvents = await client.fetch(`
      *[_type == "liveEvent" && defined(relatedArticles)] {
        _id,
        relatedArticles[]-> {
          _type,
          _id
        }
      }
    `);

    for (const event of liveEvents) {
      const updatedReferences = event.relatedArticles
        .filter((ref) => ref._type === 'post')
        .map((ref) => ({
          _ref: ref._id.replace('post-', 'article-'),
          _type: 'reference',
        }));

      if (updatedReferences.length > 0) {
        await client.patch(event._id).set({ relatedArticles: updatedReferences }).commit();
      }
    }

    // Update comments that reference posts
    const comments = await client.fetch(`
      *[_type == "comment" && defined(post)] {
        _id,
        post
      }
    `);

    for (const comment of comments) {
      if (comment.post._ref && comment.post._ref.includes('post-')) {
        await client
          .patch(comment._id)
          .set({
            post: {
              _ref: comment.post._ref.replace('post-', 'article-'),
              _type: 'reference',
            },
          })
          .commit();
      }
    }

    console.log('✅ References updated successfully.');
  } catch (error) {
    console.error('❌ Failed to update references:', error);
    throw error;
  }
}

async function cleanupOldPosts() {
  console.log('🧹 Starting cleanup of old post documents...');

  try {
    const oldPosts = await client.fetch('*[_type == "post"]');

    if (oldPosts.length === 0) {
      console.log('✅ No old posts to clean up.');
      return;
    }

    console.log(`🗑️ Found ${oldPosts.length} old posts to delete.`);

    // Delete in batches
    const batchSize = 50;
    for (let i = 0; i < oldPosts.length; i += batchSize) {
      const batch = oldPosts.slice(i, i + batchSize);
      const transaction = client.transaction();

      batch.forEach((post) => {
        transaction.delete(post._id);
      });

      await transaction.commit();
      console.log(
        `🗑️ Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldPosts.length / batchSize)}`
      );
    }

    console.log('✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
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

    // Create backup
    await backupDataset();

    // Run migration
    await migratePosts();

    // Ask user if they want to cleanup old posts
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(
      'Do you want to delete the old "post" documents? (y/N): ',
      async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await cleanupOldPosts();
        } else {
          console.log(
            '⚠️ Old "post" documents were not deleted. You can run the cleanup later if needed.'
          );
        }

        console.log('🎯 Migration process completed!');
        console.log('📝 Next steps:');
        console.log('   1. Deploy your updated schema to Sanity Studio');
        console.log('   2. Test your application thoroughly');
        console.log('   3. Update any remaining references in your codebase');

        readline.close();
        process.exit(0);
      }
    );
  } catch (error) {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  migratePosts,
  updateReferences,
  cleanupOldPosts,
  backupDataset,
};
