# UnTelevised Media — Content Schema Reference

## Schema Files Location
`src/models/schema/`

---

## article.ts

The primary content type. Represents a news article or field report.

| Field | Type | Notes |
|-------|------|-------|
| `slug` | slug | source: title |
| `title` | string | — |
| `description` | text | Used as excerpt/meta description |
| `keywords` | string | Single string — NOT an array |
| `author` | reference → author | — |
| `mainImage` | image | hotspot enabled, has alt field |
| `categories` | array → reference[] → category | — |
| `publishedAt` | datetime | — |
| `eventDate` | datetime | For event-linked articles |
| `body` | blockContent | Portable Text |
| `hasEmbeddedVideo` | boolean | — |
| `videoLink` | string | YouTube embed URL |
| `location` | string | (inferred from article page use) |

**Missing fields:** `updatedAt`, `seoTitle`, `seoDescription`, `ogImage`, `sources[]`, `reviewedBy`, `noIndex`

---

## author.ts

Represents a journalist, correspondent, or contributor.

| Field | Type | Notes |
|-------|------|-------|
| `slug` | slug | source: name |
| `name` | string | — |
| `title` | string | Job title |
| `bio` | block[] | Portable Text |
| `image` | image | hotspot, has alt |
| `order` | string | Display order |
| `twitter`, `instagram`, `facebook`, `tiktok`, `youtube`, `linkedin` | string | Handle/username |
| `website` | string | — |
| `email` | string | — |

**Missing fields:** `credentials[]`, `sameAs[]` (schema.org), `role`, `expertise[]`

---

## liveEvent.ts (inferred from queries)

| Field | Type | Notes |
|-------|------|-------|
| `slug` | slug | — |
| `title` | string | — |
| `subtitle` | string | — |
| `description` | text | — |
| `eventDate` | datetime | — |
| `isCurrentEvent` | boolean | Filters live vs past |
| `mainImage` | image | — |
| `location` | string | — |
| `videoLink` | string | — |
| `keywords` | string | — |
| `keyEvent[]` | reference[] | Sub-events |
| `relatedArticles[]` | reference[] → article | — |
| `eventTag[]` | reference[] | — |

---

## song.ts (inferred from StructuredData)

| Field | Type | Notes |
|-------|------|-------|
| `slug` | slug | — |
| `title` | string | — |
| `lyrics` | text/block | — |
| `primaryArtist` | reference → musicArtist | — |
| `featuredArtists[]` | reference[] → musicArtist | — |
| `album` | reference → album | — |
| `genres[]` | string[] | — |
| `releaseDate` | date | — |
| `duration` | string | "MM:SS" format |
| `trackNumber` | number | — |
| `recordLabel` | string | — |
| `isExplicit` | boolean | — |

---

## musicArtist.ts (inferred from StructuredData)

| Field | Type | Notes |
|-------|------|-------|
| `slug` | slug | — |
| `name` | string | — |
| `stageName` | string | — |
| `bio` | block | — |
| `genres[]` | string[] | — |
| `debutYear` | number | — |
| `hometown` | string | — |
| `recordLabel` | string | — |
| `website` | string | — |
| `socialMedia.spotify` | string | — |
| `socialMedia.youtube` | string | — |
| `socialMedia.instagram` | string | — |
| `socialMedia.twitter` | string | — |
| `socialMedia.facebook` | string | — |

---

## Other Schemas

| Schema | Purpose |
|--------|---------|
| `album` | Music album container |
| `category` | Article categorization |
| `blockContent` | Rich text definition |
| `timeline` | Timeline visualization |
| `timelineCategory` | Timeline grouping |
| `timelineEvent` | Individual timeline entries |
| `keyEvent` | Sub-events within live events |
| `eventTag` | Tagging for events |
| `policies` | Legal/policy pages |
| `secureContact` | Encrypted contact submissions |
| `whistleblower` | Encrypted tip submissions |
| `comments` | Article comments (disabled in UI) |
| `contactSubmission` | General contact form |
| `newsletterSubscribe` | Email signup |
| `jobApplication` | Careers/hiring form |
| `instagram`, `twitterX`, `youtube`, `videoContent` | Embed types |
| `buttons` | CTA button definitions |
| `post` | Legacy — superseded by `article` |
