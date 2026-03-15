# Google AdSense & Analytics Setup Guide

Complete checklist for getting ads live on UnTelevised Media.

---

## ⚠️ First: Merge the Fix Branch

**All ad-related code fixes are sitting on a feature branch and have NOT been merged.**
Until merged, none of the consent fixes, dev placeholders, or script corrections are live.

```bash
git checkout main
git merge fix/issue-7-analytics-gtm-adsense-consent
git push origin main
```

After merging:
- **Dev mode**: Ad placeholders will show without needing to accept cookies
- **Production**: GTM and AdSense scripts will load correctly when consent is given

---

## Part 1 — AdSense Account Checklist

### 1.1 Account Approval Status

Go to: **adsense.google.com → Home**

Look at the top banner. You need to see one of:
- ✅ **"Your site is ready to show ads"** — fully approved, proceed to 1.2
- ⚠️ **"Getting your site ready"** — under review (can take 2–4 weeks for new sites)
- ❌ **"Action required"** — something needs fixing before approval

> New accounts are reviewed before any ads serve. If your account shows "Getting your
> site ready", no ads will appear in production no matter what the code does. You must
> wait for approval.

**Your Publisher ID:** `ca-pub-7412827340538951`

---

### 1.2 Site Ownership Verification

Go to: **adsense.google.com → Sites**

Check that `untelevised.media` (or `www.untelevised.media`) is listed and shows:
- ✅ **"Ready"** — verified and approved
- ⚠️ **"Getting ready"** — verified but under review
- ❌ **"Requires attention"** — verification failed

**If not verified:**
1. Click **Add site**
2. Enter `www.untelevised.media`
3. Choose verification method — **"AdSense code snippet"** (your code already loads the script) or **"ads.txt"** (already exists at `/public/ads.txt`)

---

### 1.3 ads.txt File

Your `ads.txt` at `/public/ads.txt` currently contains:

```
google.com, pub-7412827340538951, DIRECT, f08c47fec0942fa0
```

✅ This is correct. Verify it is live at: `https://www.untelevised.media/ads.txt`

AdSense checks this file automatically. If it 404s or the publisher ID doesn't match your
account, ads will be blocked.

---

### 1.4 Ad Units — Verify Every Slot ID

This is the most common reason ads don't serve. **Each slot ID in the code must be
manually created as an Ad Unit in your AdSense account.** A slot ID that doesn't exist
in AdSense will simply return no ad — no error is thrown.

Go to: **adsense.google.com → Ads → By ad unit → Display ads**

Verify these slot IDs exist in your account:

| Slot ID | Placement | Type |
|---------|-----------|------|
| `3380975563` | Homepage sidebar | Display |
| `2475351335` | Homepage banner | Display |
| `2438309423` | Article top | Display |
| `8849187990` | Article bottom | Display |
| `8437036676` | Article rectangle (below share bar) | Display |
| `7939310826` | Article banner bottom | Display |
| `3403906737` | In-feed | In-feed / Native |
| `8209510850` | Category banner | Display |

**How to find a slot ID:** Click any ad unit → the ID is shown under the unit name.

**If a slot ID doesn't exist:**
1. Click **Create new ad unit → Display ads**
2. Give it a name (e.g. "Article Rectangle")
3. Set size to **Responsive**
4. Click **Create** — copy the slot ID from the generated code snippet
5. Update the matching entry in `src/lib/ads/adConfig.ts`

---

### 1.5 Payment Information

Go to: **adsense.google.com → Payments → Payment info**

You must have:
- ✅ Payment profile created
- ✅ Address verified
- ✅ Tax form submitted (W-9 for US, W-8BEN for non-US)

Ads will serve without payment info, but you won't receive earnings and Google may
suspend serving after your balance reaches the verification threshold.

---

### 1.6 Policy Compliance

Go to: **adsense.google.com → Policy center**

Common issues that block ads on news/journalism sites:
- **"Dangerous or derogatory content"** — review article content guidelines
- **"Adult content"** — any flagged pages block ads site-wide
- **"Insufficient content"** — pages with very short articles may be flagged
- **"No inventory"** — ad inventory isn't available for your traffic region/topic

If any violations are listed, resolve them before expecting ads to fill.

---

## Part 2 — Google Tag Manager Checklist

### 2.1 GTM Container ID

Your GTM ID: `GTM-5S6L6KDH`

Go to: **tagmanager.google.com → your container**

Verify:
- The container is **published** (not just saved as a draft)
- No blocking triggers exist that would prevent tags from firing

### 2.2 GA4 Tag inside GTM

Go to: **GTM → Tags**

Check if a **Google Analytics: GA4 Configuration** tag exists pointing to `G-WFZF996PSN`.

If it does NOT exist:
1. Click **New → Tag → Google Analytics: GA4 Configuration**
2. Enter Measurement ID: `G-WFZF996PSN`
3. Triggering: **All Pages**
4. Save and **Publish** the container

> If GA4 is managed inside GTM, you do NOT need `NEXT_PUBLIC_GA4_ID` set in your env.
> Set it only if you want direct GA4 events outside of GTM. Having both active
> will double-count page views.

---

## Part 3 — Testing Production Ads

### 3.1 Check the AdSense preview tool

Go to: **adsense.google.com → Ads → Overview → Preview**

Enter your URL. If ads show in the preview but not live, it's a code/consent issue.
If ads don't show in the preview either, it's an account/approval issue.

### 3.2 Verify the AdSense script is loading

In Chrome DevTools on your production site:
1. Open **Network** tab → filter by `adsbygoogle`
2. Reload the page **after accepting cookies**
3. You should see a request to `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`

If it's not there:
- Check that `NEXT_PUBLIC_GAS_ID` is set correctly in your Vercel environment variables
- Check that the cookie banner was accepted (ads only load after marketing consent)

### 3.3 Check for ad blocker

If you use uBlock Origin, AdBlock, or similar — **disable it for your domain during
testing**. Ad blockers intercept the AdSense script entirely and it will look like
the code is broken when it isn't.

### 3.4 Verify the `<ins>` elements exist

In Chrome DevTools → Elements tab, search for `adsbygoogle`.

You should see `<ins class="adsbygoogle" ...>` elements on the page. If they're there
but empty/collapsed, AdSense loaded but didn't fill the slot. If they're absent,
the component isn't rendering (consent or code issue).

---

## Part 4 — Environment Variables on Vercel

Go to: **vercel.com → your project → Settings → Environment Variables**

Confirm all of these are set for **Production**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_GTM_ID` | `GTM-5S6L6KDH` |
| `NEXT_PUBLIC_GA4_ID` | `G-WFZF996PSN` |
| `NEXT_PUBLIC_GAS_ID` | `ca-pub-7412827340538951` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `ypejdt32` |
| `SANITY_API_READ_TOKEN` | *(your token)* |
| `SANITY_REVALIDATE_SECRET` | *(your secret)* |

> ⚠️ After adding or changing env vars in Vercel, you must **redeploy** for them to take effect.
> Vercel does not apply env var changes to existing deployments.

---

## Part 5 — Why Ads Show as Blank in Development

In **development** (`pnpm dev`), real AdSense ads never load because:
1. `localhost` is not a verified AdSense domain
2. AdSense actively blocks serving ads to localhost
3. The AdSense script may be blocked by your local ad blocker

This is expected and correct behaviour. The codebase shows **development placeholders**
instead — grey dashed boxes labelled "Development Ad Placeholder" with the slot ID.

**If you are NOT seeing these placeholders in dev:**
1. Make sure the fix branch is merged to main
2. Make sure you are running the dev server from the correct branch
3. Open browser DevTools → Console — look for any `AdSense error:` messages
4. Accept the cookie banner (or the dev bypass should do it automatically after the merge)

---

## Quick Diagnosis Flow

```
Ads not showing?
│
├─ In development?
│   ├─ No placeholders at all → Is fix branch merged? Is dev server restarted?
│   └─ Placeholders showing → Code is working ✅ (real ads never show in dev)
│
└─ In production?
    ├─ Check: is the fix branch merged to main and deployed?
    ├─ Check: AdSense account status (adsense.google.com → Home)
    ├─ Check: all slot IDs exist as ad units in AdSense dashboard
    ├─ Check: ads.txt accessible at https://www.untelevised.media/ads.txt
    ├─ Check: Vercel env vars are set AND a redeploy was triggered
    └─ Check: cookie banner was accepted (marketing consent required)
```
