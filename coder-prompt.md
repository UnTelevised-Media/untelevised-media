# CODER PROMPT — Fix Sanity CMS Article Upload

## Copy and paste this to your coder:

```
URGENT: Fix Sanity CMS Article Upload for Tracy Warehouse Fire Article

Article content is COMPLETE and written. Need to fix Sanity CMS upload failure.

CURRENT STATUS:
- Article content is fully written in markdown (articles/tracy-warehouse-fire-2026.md)
- Portable Text version ready (articles/tracy-warehouse-fire-2026-portable-text.json)
- File: scripts/create-article-complete.py attempts to upload but fails with "Unknown error"

ERROR DETAILS:
- Error: "Unknown error"
- API returns 400 error: "Reference is not a valid document ID: \"\""
- Likely causes:
  1. Empty image reference in mainImage.asset._ref
  2. Source references don't exist
  3. Invalid API mutation structure

FILES TO REVIEW:
1. articles/tracy-warehouse-fire-2026.md — Complete article content
2. articles/tracy-warehouse-fire-2026-portable-text.json — Portable Text blocks
3. scripts/create-article-complete.py — Upload script that fails
4. workspace/sanity.env — API credentials
5. workspace/sanity-schema-reference.md — Sanity schema documentation

REQUIRED FIXES:
1. Debug the Sanity API error (add detailed error logging)
2. Fix image reference format (currently empty string "")
3. Verify source references exist or create them
4. Test complete article creation
5. Once working, add main image assignment step

NEXT STEPS:
1. Debug the error — add detailed logging to see exact API response
2. Fix image reference — either:
   a. Use a placeholder image from Sanity asset library
   b. Make image reference optional
   c. Create article without mainImage first, add later
3. Verify source references — check if source documents exist, create if needed
4. Test upload with create-article-complete.py
5. Once basic upload works, add main image
6. Review article in Sanity CMS
7. Publish when ready

IMPORTANT: This is breaking news. Article needs to be published ASAP.
```

---

## QUICK DEBUG STEPS:

### 1. Test Simple Article Creation First
Create a minimal article with only required fields:
- title
- slug
- body
- publishedAt

See if that works. If yes, then add additional fields (description, leadSummary, sources, etc.) one by one.

### 2. Check Image Reference
Current code has:
```python
"mainImage": {
    "_type": "image",
    "asset": {
        "_type": "reference",
        "_ref": ""  # EMPTY STRING - THIS IS THE PROBLEM
    }
}
```

Fix options:
1. Remove mainImage entirely (optional in schema)
2. Use a known asset reference from Sanity
3. Add image later after article creation

### 3. Check Source References
Current code has references to:
- source-ap-news-2026-06-16
- source-nbc-news-2026-06-16
- source-reuters-2026-06-16
- source-sf-chronicle-2026-06-16
- source-cnn-2026-06-16

These may not exist. Either:
1. Create these source documents first
2. Remove sources temporarily for testing
3. Use existing sources if they exist

### 4. Verify API Mutation Structure
Sanity API expects:
```python
{
    "mutations": [{
        "create": {
            "_id": "drafts.article-id",
            "_type": "article",
            "title": "...",
            ...
        }
    }]
}
```

Make sure the structure is correct.

### 5. Add Detailed Logging
Add print statements to show:
- API endpoint URL
- Request data (formatted JSON)
- Response status code
- Response body (full)
- Any exceptions with full traceback

This will help identify the exact error.

---

## TEST SCRIPT FOR CODER:

```python
#!/usr/bin/env python3
import requests
import json
from datetime import datetime

# Load config
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'sanity.env'))

PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
DATASET = os.getenv("SANITY_DATASET")
API_TOKEN = os.getenv("SANITY_API_WRITE_TOKEN")

# Test 1: Simple article
url = f"https://{PROJECT_ID}.api.sanity.io/v1/data/mutate/{DATASET}"
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

simple_article = {
    "_type": "article",
    "title": "Test Article",
    "slug": {
        "_type": "slug",
        "current": "test-article-2026-06-16"
    },
    "body": [
        {
            "_type": "block",
            "_key": "test",
            "style": "h1",
            "children": [
                {
                    "_key": "test-1",
                    "_type": "span",
                    "text": "Test",
                    "marks": []
                }
            ]
        }
    ],
    "publishedAt": datetime.now().isoformat()
}

print("Testing simple article creation...")
print(f"URL: {url}")

try:
    response = requests.post(url, headers=headers, json={
        "mutations": [{"create": simple_article}]
    })

    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

    if response.status_code == 200:
        print("✓ Simple article created successfully!")
    else:
        print("✗ Simple article creation failed")

except Exception as e:
    print(f"✗ Error: {e}")
```

Run this first. If it works, then add back the full content.

---

## CONTACT:

If you need more details, refer to:
- `temp/article-completion-report.md` — Full completion report
- `articles/tracy-warehouse-fire-2026.md` — Complete article content
- `workspace/sanity-schema-reference.md` — Sanity schema documentation

Good luck! 🚀
