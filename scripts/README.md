# Sanity Migration Scripts

This directory contains scripts for copying and migrating content between different schema types in Sanity.

## Scripts Overview

### 1. Copy Posts to Articles (`copy-posts-to-articles.js`)

**Purpose**: Copies all posts to articles while keeping the original posts intact.

**Usage**:
```bash
# Preview what will be copied (recommended first step)
npm run preview:copy-posts-to-articles

# Run the actual copy operation
npm run copy:posts-to-articles
```

**What it does**:
- ✅ Creates new article documents from existing posts
- ✅ Keeps original posts unchanged
- ✅ Skips posts that already have corresponding articles (based on title/slug)
- ✅ Creates automatic backups before running
- ✅ Processes in batches for better performance
- ✅ Generates new IDs for articles to avoid conflicts

### 2. Preview Copy Operation (`preview-copy-posts-to-articles.js`)

**Purpose**: Shows what will happen when you run the copy operation without making any changes.

**Usage**:
```bash
npm run preview:copy-posts-to-articles
```

**What it shows**:
- Number of posts found
- Number of existing articles
- Which posts will be copied
- Which posts will be skipped (and why)
- Summary of the operation

### 3. Migrate Posts to Articles (`migrate-posts-to-articles.js`)

**Purpose**: Migrates posts to articles and optionally deletes the original posts.

**Usage**:
```bash
npm run migrate:posts-to-articles
```

**⚠️ Warning**: This script can delete original posts. Use with caution.

## Environment Setup

Before running any scripts, make sure you have the following environment variables set in your `.env.local` or `.env` file:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=your_dataset_name
SANITY_API_WRITE_TOKEN=your_write_token
SANITY_API_READ_TOKEN=your_read_token  # Optional, can use write token for both
```

### Getting Your Sanity Tokens

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to "API" tab
4. Create a new token with appropriate permissions:
   - **Read token**: For preview operations
   - **Write token**: For copy/migrate operations

## Recommended Workflow

1. **Preview first** (always recommended):
   ```bash
   npm run preview:copy-posts-to-articles
   ```

2. **Copy posts to articles** (safe operation):
   ```bash
   npm run copy:posts-to-articles
   ```

3. **Verify in Sanity Studio** that articles were created correctly

4. **Update your application code** to handle both posts and articles

5. **Optional**: If you want to remove original posts later, use the migrate script

## Safety Features

- **Automatic backups**: All scripts create timestamped backups before making changes
- **Duplicate detection**: Scripts check for existing articles to avoid duplicates
- **Batch processing**: Large datasets are processed in batches to avoid timeouts
- **Confirmation prompts**: Scripts ask for confirmation before making changes
- **Error handling**: Comprehensive error handling with helpful messages

## Backup Location

Backups are automatically created in:
```
scripts/backups/backup-YYYY-MM-DDTHH-MM-SS-sssZ.json
```

## Troubleshooting

### Common Issues

1. **Missing environment variables**:
   - Check that all required environment variables are set
   - Verify the variable names match exactly

2. **Permission errors**:
   - Ensure your API token has the correct permissions
   - Write operations require a token with write permissions

3. **Network timeouts**:
   - Large datasets may take time to process
   - Scripts use batching to minimize this issue

4. **Duplicate content**:
   - Scripts automatically detect and skip duplicates
   - Based on matching title or slug

### Getting Help

If you encounter issues:

1. Run the preview script first to diagnose the problem
2. Check the console output for specific error messages
3. Verify your environment variables are correct
4. Ensure your Sanity project and dataset are accessible

## Schema Compatibility

These scripts work with the current post and article schemas. If you modify the schemas, you may need to update the scripts accordingly.

The scripts handle:
- All standard fields (title, slug, description, etc.)
- References (author, categories)
- Images with metadata
- Rich text content (blockContent)
- Custom fields specific to your schemas
