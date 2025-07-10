// scripts/dry-run-migration.js

/**
 * This script performs a dry-run of the post-to-article migration.
 * It shows what would happen without making any actual changes.
 * Run this script with: node scripts/dry-run-migration.js
 */

const { createClient } = require('@sanity/client');
const path = require('path');

// Load environment variables from multiple possible locations
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Sanity client (read-only for dry run)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-06-04',
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function dryRunMigration() {
  console.log('🧪 DRY RUN: Post-to-Article Migration Preview');
  console.log('⚠️  This is a preview only - no changes will be made\n');

  try {
    // Step 1: Analyze existing data
    console.log('📋 Analyzing existing data...');

    const posts = await client.fetch('*[_type == "post"]');
    const articles = await client.fetch('*[_type == "article"]');
    const liveEvents = await client.fetch('*[_type == "liveEvent"]');
    const comments = await client.fetch('*[_type == "comment"]');

    console.log(`   📊 Found ${posts.length} posts to migrate`);
    console.log(`   📊 Found ${articles.length} existing articles`);
    console.log(`   📊 Found ${liveEvents.length} live events`);
    console.log(`   📊 Found ${comments.length} comments`);

    if (posts.length === 0) {
      console.log('\n✅ No posts to migrate. Migration not needed.');
      return;
    }

    // Step 2: Analyze post data quality
    console.log('\n🔍 Analyzing post data quality...');

    const postsWithoutTitle = posts.filter((p) => !p.title);
    const postsWithoutSlug = posts.filter((p) => !p.slug);
    const postsWithoutAuthor = posts.filter((p) => !p.author);
    const postsWithBody = posts.filter((p) => p.body);

    console.log(
      `   ✅ Posts with titles: ${posts.length - postsWithoutTitle.length}/${posts.length}`
    );
    console.log(
      `   ✅ Posts with slugs: ${posts.length - postsWithoutSlug.length}/${posts.length}`
    );
    console.log(
      `   ✅ Posts with authors: ${posts.length - postsWithoutAuthor.length}/${posts.length}`
    );
    console.log(`   ✅ Posts with body content: ${postsWithBody.length}/${posts.length}`);

    if (postsWithoutTitle.length > 0) {
      console.log(`   ⚠️  ${postsWithoutTitle.length} posts without titles may cause issues`);
    }
    if (postsWithoutSlug.length > 0) {
      console.log(`   ⚠️  ${postsWithoutSlug.length} posts without slugs may cause issues`);
    }
    if (postsWithoutAuthor.length > 0) {
      console.log(`   ⚠️  ${postsWithoutAuthor.length} posts without authors may cause issues`);
    }

    // Step 3: Show sample migration
    console.log('\n📝 Sample Migration Preview:');

    const samplePost = posts[0];
    console.log(`\n   📄 Sample Post: "${samplePost.title || 'Untitled'}"`);
    console.log(`      ID: ${samplePost._id}`);
    console.log(`      Type: ${samplePost._type}`);
    console.log(`      Created: ${samplePost._createdAt}`);

    console.log('\n   ➡️  Would become Article:');
    console.log(`      Type: article`);
    console.log(`      Title: ${samplePost.title || 'Untitled'}`);
    console.log(`      Slug: ${samplePost.slug?.current || 'No slug'}`);
    console.log(`      Author: ${samplePost.author?.name || 'Reference to author'}`);
    console.log(`      Categories: ${samplePost.categories?.length || 0} categories`);
    console.log(`      Has body: ${samplePost.body ? 'Yes' : 'No'}`);
    console.log(`      Has image: ${samplePost.mainImage ? 'Yes' : 'No'}`);

    // Step 4: Analyze references that would be updated
    console.log('\n🔗 Reference Analysis:');

    // Check live events with post references
    const liveEventsWithPosts = await client.fetch(`
      *[_type == "liveEvent" && defined(relatedArticles)] {
        _id,
        title,
        "postRefs": count(relatedArticles[_ref in *[_type == "post"]._id])
      }[postRefs > 0]
    `);

    console.log(`   📋 Live Events with post references: ${liveEventsWithPosts.length}`);
    liveEventsWithPosts.forEach((event) => {
      console.log(
        `      "${event.title}": ${event.postRefs} post references → would become article references`
      );
    });

    // Check comments with post references
    const commentsWithPosts = await client.fetch(`
      *[_type == "comment" && defined(post)] {
        _id,
        post
      }
    `);

    console.log(`   💬 Comments with post references: ${commentsWithPosts.length}`);
    if (commentsWithPosts.length > 0) {
      console.log(`      These would be updated to reference articles instead`);
    }

    // Step 5: Migration plan summary
    console.log('\n📋 Migration Plan Summary:');
    console.log(`   📝 Would create ${posts.length} new article documents`);
    console.log(`   🔗 Would update ${liveEventsWithPosts.length} live event references`);
    console.log(`   💬 Would update ${commentsWithPosts.length} comment references`);
    console.log(`   💾 Would create backup before starting`);
    console.log(`   🗑️  Would optionally delete ${posts.length} old post documents`);

    // Step 6: Potential issues
    console.log('\n⚠️  Potential Issues:');

    const issues = [];

    if (articles.length > 0) {
      issues.push(`${articles.length} articles already exist - migration may have run before`);
    }

    if (postsWithoutTitle.length > 0) {
      issues.push(`${postsWithoutTitle.length} posts missing titles`);
    }

    if (postsWithoutSlug.length > 0) {
      issues.push(`${postsWithoutSlug.length} posts missing slugs`);
    }

    // Check for duplicate slugs
    const slugs = posts.map((p) => p.slug?.current).filter(Boolean);
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlugs.length > 0) {
      issues.push(`${duplicateSlugs.length} duplicate slugs found`);
    }

    if (issues.length === 0) {
      console.log('   ✅ No issues detected - migration should proceed smoothly');
    } else {
      issues.forEach((issue) => console.log(`   ⚠️  ${issue}`));
    }

    // Step 7: Recommendations
    console.log('\n💡 Recommendations:');
    console.log('   1. ✅ Run the full migration script: npm run migrate:posts-to-articles');
    console.log('   2. 💾 Backup will be created automatically');
    console.log('   3. 🧪 Test articles in Sanity Studio after migration');
    console.log('   4. 🌐 Test frontend application thoroughly');
    console.log('   5. 🗑️  Delete old posts only after confirming everything works');

    if (issues.length > 0) {
      console.log('\n🔧 Before migrating, consider:');
      console.log('   - Fixing posts with missing titles or slugs');
      console.log('   - Resolving duplicate slugs');
      console.log('   - Checking existing articles to avoid conflicts');
    }

    console.log('\n🎯 Next Steps:');
    console.log('   → If everything looks good: npm run migrate:posts-to-articles');
    console.log('   → To verify environment: npm run verify-env');
    console.log('   → After migration: node scripts/verify-migration.js');
  } catch (error) {
    console.error('❌ Dry run failed:', error);
    process.exit(1);
  }
}

// Execute dry run
dryRunMigration().catch((error) => {
  console.error('❌ Dry run failed:', error);
  process.exit(1);
});
