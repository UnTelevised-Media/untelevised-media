# Live Editing & Preview Mode Setup

This document explains how to use the live editing and preview mode features with Sanity CMS.

## Features

### 1. Draft Mode / Preview Mode

- **Purpose**: View unpublished content and drafts
- **Access**: Available through Sanity Studio or direct URL
- **Visual Indicator**: Blue banner at the top when active

### 2. Live Mode

- **Purpose**: Real-time content updates without page refresh
- **Technology**: Sanity's Live Content API with experimental `vX` API version
- **Automatic**: Enabled when in draft mode

### 3. Visual Editing

- **Purpose**: Click-to-edit functionality directly on the website
- **Integration**: Seamless connection between website and Sanity Studio
- **Overlays**: Interactive editing overlays on content

## How to Use

### Enabling Preview Mode

#### From Sanity Studio:

1. Open Sanity Studio at `/studio`
2. Navigate to any document (Article, Author, etc.)
3. Click the "Preview" tab in the studio
4. This will open the live preview with draft content

#### Direct URL Access:

```
/api/draft?secret=YOUR_PREVIEW_SECRET&slug=/articles/your-article-slug
```

### Disabling Preview Mode

- Click "Exit Preview" in the blue banner
- Or visit: `/api/disable-draft`

## Environment Variables

Add these to your `.env.local`:

```env
# Required for preview mode
SANITY_PREVIEW_SECRET=your-secret-here

# Required for live content (already configured)
SANITY_API_READ_TOKEN=your-read-token
```

## Technical Implementation

### API Routes

- `/api/draft` - Enables preview mode with URL validation
- `/api/disable-draft` - Disables preview mode

### Components

- `DraftModeBanner` - Shows preview mode status
- `SanityVisualEditing` - Enables click-to-edit functionality
- `SanityLive` - Provides real-time content updates

### Fetch Strategy

The system automatically switches between:

- **Draft Mode**: Uses live `sanityFetch` with `previewDrafts` perspective
- **Production**: Uses cached `sanityFetch` with `published` perspective

## Studio Configuration

The Sanity Studio includes:

- **Presentation Tool**: Live preview panel
- **Structure Tool**: Content management
- **Vision Tool**: GROQ query testing

## Content Types Supported

All content types support live editing:

- Articles (`/articles/[slug]`)
- Authors (`/author/[slug]`)
- Live Events (`/live-event/[slug]`)
- Categories (`/category/[slug]`)
- Policies (`/policies/[slug]`)

## Troubleshooting

### Preview Mode Not Working

1. Check `SANITY_PREVIEW_SECRET` is set
2. Verify the secret matches in Studio and environment
3. Ensure `SANITY_API_READ_TOKEN` has proper permissions

### Live Updates Not Appearing

1. Confirm you're in draft mode (blue banner visible)
2. Check browser console for WebSocket connection errors
3. Verify API version is set to `vX` in live configuration

### Visual Editing Not Responding

1. Ensure you're accessing from Sanity Studio's preview panel
2. Check that `allowStudioOrigin` is enabled
3. Verify the studio URL matches your configuration

## Security Notes

- Preview mode requires a secret token
- Live content API uses read-only tokens
- Draft content is only accessible when authenticated
- Visual editing only works from authorized studio origins
