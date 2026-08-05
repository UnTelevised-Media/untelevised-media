# UTM Writing Standards — Feedback & Training Guide

**For:** Ash Fawkes **From:** Tyler Durden, Sr. Political Analyst **Purpose:** Breakdown of gaps between your recent drafts and UTM publication standards, with clear guidance on how to get there.

---

Hey Ash — looked at both your drafts ("Oct. 7th: A False Flag That Will Live In Infamy" and "BREAKING: Another false flag attack on Egypt by Israel"). You've got good instincts for stories and the right political angle. The gaps are structural and editorial. Here's exactly what needs to change.

---

## 1. Article Structure: Go Beyond Stream of Consciousness

**What I'm seeing:** Your Oct. 7 draft reads like a Reddit comment or a list of bullet points. No headings, no narrative flow, no sections. Just one long paragraph of claims linked loosely together.

**What UTM needs:** Articles are structured with **H2 headings** that break the narrative into clear sections. Each section develops one thread of the story. The reader should be able to scan headings and understand the arc.

**Example from the fleshed-out Oct. 7 draft:**

- _The Warnings That Were Buried_
- _The Stand-Down Order_
- _The Hannibal Directive: Friendly Fire on the Festival-Goers_
- _Insider Trading: Profits from Foreknowledge_
- _The Festival Relocated to the Kill Zone_
- _The Evidence Destruction: Cover-Up in Real Time_

Each heading advances the argument. Each section starts with the strongest evidence and layers context underneath.

**Action:** Before writing, outline your sections. What are the 5-7 threads? Order them so each one builds on the last. Write each as a self-contained mini-essay with its own evidence.

---

## 2. Sourcing: Every Claim Needs a Name

**What I'm seeing:** Your Oct. 7 draft makes claims like "there were warnings for months" and "reports were ignored" and "a stand down was ordered" with zero attribution. The reader has no way to verify anything. Links point to broken URLs (the "ignored.At" link literally goes nowhere).

**What UTM needs:** Every major claim is sourced to a specific outlet, document, or study. We name the institution, the report, the author. The reader should never have to guess where information comes from.

**Example — weak vs. strong:**

❌ **Weak:** "Warnings were ignored for months." ✅ **Strong:** "According to Shin Bet's own internal review published in March 2025, the agency had obtained detailed intelligence about Hamas's plans to breach the perimeter fence — but failed to translate those warnings into actionable alerts."

❌ **Weak:** "Law professors found insider trading." ✅ **Strong:** "Research by law professors Robert Jackson Jr. of New York University and Joshua Mitts of Columbia University found that short-selling on the MSCI Israel ETF surged to 99% of total volume on October 2, 2023 — five days before the attack."

**Action:** Before writing, collect 10-15 sources. For each claim in your draft, ask: "Where does this come from?" If you can't name a source, don't make the claim.

---

## 3. Required Metadata Fields: No Exceptions

**What I'm seeing:** Your recent drafts are missing almost every required metadata field:

- `methodology` — **empty** (how did you report this?)
- `eventDate` — **empty** (when did the event happen?)
- `reviewedBy` — **null** (who approved this?)
- `faqs` — **empty** (needs 3-5 FAQ items)
- `relatedArticles` — **empty** (needs up to 6 related article refs)
- `tags` — **wrong format** (you used single strings instead of arrays)
- `keywords` — **wrong format** (same issue)
- `categories` — **missing**

**What UTM requires — all 18 fields:**

| Field             | Your Draft                  | Standard                        |
| ----------------- | --------------------------- | ------------------------------- |
| `title`           | ✅                          | Plain string                    |
| `slug`            | ✅                          | Slug object                     |
| `description`     | ✅ (too long/rambling)      | 150-160 chars, SEO sharp        |
| `leadParagraph`   | ✅ (too long, contains URL) | 2-3 sentences, plain text       |
| `author`          | ✅                          | Reference to your author ID     |
| `reviewedBy`      | ❌ null                     | Must be Edward's ref            |
| `categories`      | ❌ missing                  | Array of category refs          |
| `sources`         | ⚠️ 1-2 only                 | 10-15 source refs               |
| `faqs`            | ❌ empty                    | 3-5 FAQ items                   |
| `relatedArticles` | ❌ empty                    | Up to 6 related refs            |
| `eventDate`       | ❌ empty                    | ISO datetime                    |
| `location`        | ⚠️ wrong format             | Plain string                    |
| `methodology`     | ❌ empty                    | Plain string describing methods |
| `tags`            | ❌ wrong format             | Array of 10 strings             |
| `keywords`        | ❌ wrong format             | Array of 10 strings             |
| `publishedAt`     | ✅ null                     | ISO datetime                    |
| `body`            | ⚠️ raw text                 | Portable Text with headings     |
| `mainImage`       | ✅                          | Image object with alt/caption   |

**Action:** Use this checklist on every article before submitting. Zero exceptions.

---

## 4. Writing Voice: Ditch the Casual Tone

**What I'm seeing:** Phrases like "you bet," "tons of other ignored warnings," "this should suffice for now," and "we may never know." This reads like a text message, not an investigative piece.

**What UTM needs:** Sharp, grounded, analytical. Every sentence should earn its place. No filler, no hedging, no casual asides. We're not having a conversation — we're building a case.

**Examples of phrases to eliminate:**

- "you bet" → Just state the fact
- "tons of other" → Name them specifically
- "this should suffice for now" → Never end an article this way
- "we may never know" → Either name what we don't know specifically, or cut it
- "So can we say it was definitely a false flag? No, but..." → We already know our position. Write from conviction with evidence.

**Voice reference:** Read some of Tyler's published pieces on the site. The tone is calm outrage — not performative, not casual. Every sentence carries weight.

---

## 5. The Description Field Is Not a Summary

**What I'm seeing:** Your description is basically the article's first paragraph — 200+ words with a run-on sentence and a dangling "as well as."

**What UTM needs:** A single, tight sentence (150-160 characters max) that hooks the reader and contains key SEO terms. It's the meta description that appears in search results and social shares.

**Example from the Oct. 7 draft:** "Months of ignored warnings, a stand-down order during the attack, insider trading days before, a festival relocated to the kill zone, and systematic evidence destruction — the evidence that October 7 was either allowed to happen or engineered by design."

That's one sentence. It's 228 characters but covers the main arguments. It's what makes someone click.

**Action:** Write your description LAST. After the article is done. Distill it to one sentence with the most compelling claim.

---

## 6. leadParagraph Is Not a Paragraph — It's a Featured Snippet

**What I'm seeing:** Your leadParagraph is essentially the whole article condensed, including raw URLs embedded in the text.

**What UTM needs:** 2-3 clean sentences, plain text only (no URLs, no markdown), that summarize the article for AI extraction and featured snippets. It should answer "what is this about?" in a way a search engine can parse.

**Action:** Write it as: [What happened] + [Why it matters] + [What the evidence shows]. No links. No formatting.

---

## 7. Stop Creating Duplicate Drafts

**What I'm seeing:** You have 4 copies of the Egypt false flag article and 2 copies of the Oct. 7 article. Each time you save, a new draft is created instead of patching the existing one.

**Action:** Always patch the existing draft, don't create new ones. If you're using Sanity Studio, edit the draft in place. If you're unsure which is the latest, ask Tyler to check. Duplicate drafts waste storage and create confusion about which version is current.

---

## 8. Images Need Context

**What I'm seeing:** Your mainImage alt text is literally the article title ("October 7th a false flag that will live in infamy"). Alt text should describe what's in the image.

**What UTM needs:**

- **Alt text:** Describes the visual content for accessibility (e.g., "Smoke rising from the Nova music festival site on October 7, 2023")
- **Caption:** Provides editorial context (e.g., "Israeli helicopters fired on the Nova festival site, killing an unknown number of civilians fleeing the Hamas attack")
- **Credit:** Who took or owns the image
- **Body images:** 2-3 images placed inline between sections (not in the markdown, uploaded separately)

---

## 9. Categories & Tags Must Be Arrays

**What I'm seeing:** Your tags field is a single string: `"Egypt Israel False flag attack Suez Canal"`

**What UTM needs:** Tags and keywords are arrays of individual strings:

```json
"tags": ["Egypt", "Israel", "False Flag", "Suez Canal", "Tanker Attack"],
"keywords": ["Egypt tanker attack", "Israel false flag", "Suez Canal disruption"]
```

**Available categories** (use the ID references):

- Gaza/Israel War: `d4f4b7a7-8a5c-42fa-9b71-52588173e5e3`
- Politics: `78f98a64-80f6-4507-9566-a6d28d4c25fe`
- World News: `df42a50e-896c-4b20-898c-4ace0e838dcd`
- Human Rights: `e126f20a-7b65-42a5-96a0-32bb460e803d`
- US News: `7802c11d-4e66-46f0-ba16-b0620302344d`

---

## 10. FAQs Are Structured Data — Not Afterthoughts

**What I'm seeing:** Empty faqs array on both recent drafts.

**What UTM needs:** 3-5 FAQ items with question and plain-text answer. Think about what a reader would search for after reading the headline. Each FAQ is a mini-article that can appear in Google's "People Also Ask" results.

**Example from the Oct. 7 draft:**

- Q: "What evidence suggests October 7 was not a surprise attack?"
- A: "Israeli intelligence agencies had months of detailed warnings..."

**Action:** Write FAQs before you write the article. They force you to identify your strongest claims and articulate them clearly.

---

## Quick Checklist Before Submitting Any Article

- [ ] Body has H2 headings separating distinct sections
- [ ] Every major claim is sourced to a named outlet/report/study
- [ ] No casual language ("you bet", "tons of", "this should suffice")
- [ ] Description is one sentence, 150-160 chars, SEO sharp
- [ ] leadParagraph is 2-3 sentences, plain text, no URLs
- [ ] `methodology` field describes your reporting methods
- [ ] `eventDate` is set to when the event occurred (ISO datetime)
- [ ] `reviewedBy` is set to Edward's ID
- [ ] `categories` contains 2-3 category refs (arrays, not strings)
- [ ] `tags` is an array of 8-10 individual strings
- [ ] `keywords` is an array of 8-10 SEO strings
- [ ] `faqs` has 3-5 FAQ items
- [ ] `relatedArticles` has up to 6 refs to other UTM articles
- [ ] 10+ sources attached
- [ ] mainImage has proper alt text, caption, and credit
- [ ] No duplicate drafts — patch the existing one
- [ ] No broken links — verify every URL
- [ ] Body is 800+ words with substantive analysis per section
- [ ] No markdown images in the body text

---

## Your Strengths (Keep Building These)

- **Story instinct:** You identify compelling narratives and underreported angles
- **Political clarity:** Your framing is anti-imperialist and aligned with UTM's mission
- **Initiative:** You're finding stories and getting drafts started — that's exactly what we need

## Where to Focus

The gap between your current drafts and publication-ready work is **structure, sourcing, and metadata discipline** — not ideology, not instinct. If you nail the checklist above, your pieces will move much faster through the editorial pipeline and have larger organic reach.

Questions? Hit Tyler up.

---

_Tyler Durden — Sr. Political Analyst, UnTelevised Media_
