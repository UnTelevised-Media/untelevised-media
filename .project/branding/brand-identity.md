# UnTelevised Media — Brand Identity

## Mission Statement

UnTelevised Media is an **independent, reader-funded journalism platform** that goes where mainstream media won't. The editorial voice is confrontational, urgent, and mission-driven.

> "We don't just report the news — we uncover the stories they don't want you to see."

---

## Brand Pillars

| Pillar           | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **Independence** | No corporate sponsors or government funding. Reader-supported only. |
| **Courage**      | Goes to dangerous places, asks difficult questions.                 |
| **Transparency** | Funding sources, editorial decisions, and methods are open.         |
| **Urgency**      | Content is framed as live, breaking, and critical.                  |

---

## Voice & Tone

- **Uppercase headings everywhere** — creates urgency and gravity
- **Short, declarative copy** — no hedging or qualification
- **Action-oriented CTAs** — "FUND THE TRUTH", "JOIN THE MISSION", "DONATE NOW"
- **Adversarial framing** — "where mainstream media fears to tread", "the stories they don't want you to see"
- **Militaristic vocabulary** — "Field Reports", "On the Ground", "Mission", "Resistance"

### Headline Examples

- "THE TRUTH WON'T REPORT ITSELF"
- "UNFILTERED. UNCENSORED. UNCOMPROMISING."
- "EXPOSING TRUTH IN A WORLD OF LIES"
- "JOURNALISM THAT SERVES PEOPLE, NOT PROFIT"

---

## Logo Usage

- Logo is a circular image (`/Logo.png`) with a red border glow
- A red pulse dot animates in the top-right corner of the logo (LIVE indicator)
- Logo links to homepage `/`
- On desktop: logo + wordmark "UnTelevised" / "Independent Media"
- On mobile: logo icon only (wordmark hidden at `< xl` breakpoint)

---

## Brand Color

The primary brand color is:

```
untele: #D70606  (strong red)
```

This is defined as a custom Tailwind token and used for:

- Section label bars (`bg-untele`)
- CTA buttons (`bg-untele` → `hover:bg-red-600`)
- Accent borders (`border-untele`)
- Animated pulse elements (`text-untele`)
- Category tags (`bg-untele`)
- Breaking news indicators

---

## Web Properties

| Property      | URL                      | Purpose                   |
| ------------- | ------------------------ | ------------------------- |
| Main site     | `untelevised.media`      | News, articles, events    |
| Live coverage | `untelevised.live`       | Real-time event streaming |
| Radio         | `radio.untelevised.live` | Music/Radio stream        |

---

## Content Pillars

1. **Breaking News & Live Events** — real-time coverage, field reports
2. **Investigative Journalism** — long-form deep dives
3. **Past Events Archive** — historical record of covered events
4. **Music & Lyrics** — secondary arm supporting artists
5. **Documentary** — long-form visual content
6. **Citizen Journalism** — community correspondent network

---

## Navigation Structure

```
Primary Nav:
  Live Coverage → untelevised.live (external)
  Breaking Events → /breaking
  Past Events → /past-events
  Radio → radio.untelevised.live (external)
  Music → /lyrics
  Our Team → /staff
  Mission → /about

CTAs:
  Support / Donate → /donate
  Join → /join
  Secure Contact → /secure-contact
  Whistleblower → /whistleblower
```

---

## Social Presence

Platforms actively linked in header/footer:

- Twitter/X
- Instagram
- Facebook
- YouTube
- TikTok

Social links use `react-social-icons` package.
