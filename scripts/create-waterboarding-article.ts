/**
 * scripts/create-waterboarding-article.ts
 * Creates Justin King's "So, I was waterboarded…" first-person account in Sanity.
 * Run: node_modules/.bin/ts-node --esm scripts/create-waterboarding-article.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-06-04',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
});

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function block(text: string, style = 'normal') {
  return {
    _type: 'block',
    _key: makeKey(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: makeKey(), text: text.trim(), marks: [] }],
  };
}

async function wikimediaImageUrl(filename: string): Promise<string | null> {
  try {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const pages = (
      data as Record<string, unknown> & { query?: { pages?: Record<string, unknown> } }
    ).query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as { imageinfo?: Array<{ url: string }> };
    return page?.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

const body = [
  block(
    "Columbus, OH — The summary of the torture report was released, and the dutiful US media did everything it could to change the story. The reasoning behind this was simple: it was in the best interest of the United States government to conceal the fact that 1 out of 4 people that were sodomized, waterboarded, or otherwise tortured by the US government were completely innocent. It's also best if the American public doesn't know that the people running the program are so inept that they tortured two of our own people. The most important thing you shouldn't know: waterboarding has not produced any actionable intelligence, ever."
  ),

  block(
    'A human being with a conscience and fellow journalist for The Anti-Media named Derrick Broze thought that as part of our mission to counter government propaganda, we should refocus the eyes of the nation on the report that has been all but forgotten. Sadly, in the United States bringing people\'s focus back to "old news" is difficult at best. We needed something to spark the public\'s interest. Broze envisioned joint demonstrations occurring all over the country on the 31st of January. Without really thinking about it, I volunteered to be waterboarded.'
  ),

  block(
    "Unite Ohio and other groups were already coordinating a demonstration at the State Courthouse for that very date. They immediately agreed to participate in the National Day of Action Against Torture. The groups even assisted in finding a suitable torturer who wasn't likely to kill me by accident."
  ),

  block(
    "The day of the event, I met Mike (many of the activists involved strive to retain their anonymity and will be referred to by their first names), and we briefly discussed the plan. Zach, an Anonymous-affiliated activist had also agreed to be waterboarded. While I don't know Zach's age, his youthful appearance gave me doubts about whether he would go through with it when the time came. Mike walked us through the dangers, safety procedures, safe words and signs, and explained in detail what was going to happen."
  ),

  block(
    'Basically, the victim is laying at an angle so their feet and lungs are above their head. A wet cloth is placed over their face and their mouth is held open. Water is then poured onto the damp cloth, it soaks through, and fills the nose and throat with water. In essence, while the victim is not technically drowning because no fluid enters the lungs, the water has cut off air from entering or exiting. Through human development, the body has developed a warning signal to alert the person to the possibility of drowning. When water hits certain parts of the inside of the nose and throat, adrenaline is released and the mind triggers a flight response. The flight response is the most dangerous in this situation because sitting up in an attempt to get away would send the fluid into the lungs and drown the victim.'
  ),

  block(
    'We agreed to do two very different versions of waterboarding. Zach would receive a very clinical waterboarding in the style as it is described to congress and shown on the media. Mike would then proceed through my session in phases, starting with a slow build of length of pour, then adding the typical verbal abuse and threats that come with waterboarding, and ending by adding some (hopefully) light physical abuse to the face.'
  ),

  block(
    'The event proceeding featured speeches from Unite Ohio, a roundtable session from Solutions Institute, and a speech from the new coordinator of PANDA (a group dedicated to ending indefinite detention).'
  ),

  block(
    'Showtime. We set up the board using the base of the "Peace" statute. The water was placed. Now was the time for Zach to back out, but he didn\'t. He nodded and bounced a couple of times to amp himself up while I was being bound with tape, he then hopped down on the board.'
  ),

  block(
    'I watched intently as he was waterboarded. His expressions during the periods in which he was allowed to breathe made me realize that I hadn\'t quite thought this all the way through. It\'s easy to say "Yeah, I can take it." Watching someone else coughing and wheezing certainly made me realize that this was not the best plan I had ever dreamed up. When he signaled the end of the demonstration, he came up and we squatted by each other, my hands still bound. He gave me what could only be described as a "Holy shit, I did it" grin. He had reason to be proud. It was a couple of degrees below freezing and he had just endured torture.'
  ),

  block(
    'My face was covered by a beanie labeled "Innocent Civilian," and then I was on my back awaiting the inevitable. Mike asked me if I was ready, had me repeat my mock confession to end the scenario, and recovered my face. He doused the beanie to prepare it for the session and the temperature of the water surprised me. I gasped and inhaled a bit. The waterboarding hadn\'t even started yet, and I was already coughing up water.'
  ),

  block(
    'I felt the wet cloth hit my face and tried to focus on remembering the sensations I was about to feel. The second the water filled my nose and mouth, all I could remember was wanting to get up. The instinctual desire to not drown is not something that can be overcome by mind over matter. Even though this was a controlled scenario, panic was at the edge of my mind.'
  ),

  block(
    'While it was occurring the only thing I could manage to focus on was holding out until I felt slaps. I couldn\'t have told you how many cycles I had gone through or how long each cycle lasted. It felt like an eternity. Only later while watching the footage was I able to determine that my "eternity" was only a few seconds each time. I was also surprised to see my head jerking back and forth in a futile attempt to get out from under the stream of water. The movement was completely involuntary.'
  ),

  block(
    'During what seemed like an exceptionally long pour of water, I heard somebody yelling "let him up." I thought those watching had seen my body react in a bad way. The water kept flowing for what seemed like a few more years. Then suddenly somebody was pulling me up by my arm. I still had water in my mouth and nose when I realized it was an Ohio State Police officer. I became dead weight and rolled onto my side to empty the remaining water. For some reason, I blurted "I consented!" It was as if I believed the officer thought this was some form of very bizarre assault being filmed by random pedestrians.'
  ),

  block(
    "My senses came back around while the officer was yelling that he believed my life was in danger. I heard the crowd yelling back. The choice was either get arrested, or capitalize on the officer's words. I stood and repeated what the officer said. The crowd finished my sentence."
  ),

  block(
    'A normal human being seeing this knows that this is dangerous and harmful, yet our government continues to claim that it is not torture.'
  ),

  block(
    "The officers were subjected to a little bit of chastising from the crowd, and they pulled back to a location where they could watch, but not further interfere. While I'm sure some might disagree, I don't believe the officers were out of line. Yes, what was happening would certainly be held as a valid form of political protest and be covered under the First Amendment. At the same time, we live in a litigious society and if somebody is doing something that could cause harm on those grounds and the officers failed to act, it is very possible they could have been sued. The officers could have easily decided to charge my torturers with a crime under reckless endangerment or some other such statute. They didn't. I don't often take up for officers, but in this instance, I can at least see their point of view."
  ),

  block('Questions after the fact', 'h2'),
  block('After the demonstration, I have been repeatedly asked two questions:'),

  block('Why would you do that?', 'h3'),
  block(
    "The painfully obvious answer is that I'm not very bright, but my intention was to refocus attention on the torture program in place by the United States government."
  ),

  block('What do I need to know about the torture program?', 'h3'),
  block(
    "The media seems to focus on waterboarding because the American people have already accepted it. The fact is that the program includes sodomy. Our government shoves a tube into the anus of a suspect and forces water or blended food inside. There is no medical reason for this procedure. They knowingly kidnap innocent people. They kidnapped the mentally challenged brother of one detainee simply to exert pressure on him. They unknowingly kidnap innocent people. One out of every four suspects was determined to be innocent. We don't know how many admitted to crimes they didn't commit because they were tortured into confessing. The process is so haphazard that the Central Intelligence Agency even kidnapped and tortured two of their own people before realizing their mistake. They threaten to rape the mothers of suspects. There is no accountability for the actions of the torturers. The program is an utter failure. The four-year investigation of the program determined that there was"
  ),
  block(
    '“no evidence that terror attacks were stopped, terrorists captured, or lives saved.”',
    'blockquote'
  ),
];

async function main() {
  console.log('Creating Justin King waterboarding article...\n');

  // ── Image: Waterboarding illustration, US Army Field Manual 2-22.3 (public domain) ──
  console.log('Looking up waterboarding illustration on Wikimedia Commons...');
  let mainImageRef: string | null = null;
  const candidates = [
    {
      filename: 'Waterboarding_Illustration_from_2007_U.S._Army_Field_Manual.jpg',
      contentType: 'image/jpeg',
      alt: 'Waterboarding illustration from the 2007 U.S. Army Field Manual (public domain)',
    },
    {
      filename: 'US_waterboarding_illustration.jpg',
      contentType: 'image/jpeg',
      alt: 'U.S. military waterboarding illustration (public domain)',
    },
  ];

  for (const candidate of candidates) {
    const url = await wikimediaImageUrl(candidate.filename);
    if (!url) {
      console.log(`  ✗ Not found: ${candidate.filename}`);
      continue;
    }
    console.log(`  Found: ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const asset = await client.assets.upload('image', buf, {
        filename: candidate.filename,
        contentType: candidate.contentType,
      });
      mainImageRef = asset._id;
      console.log(`✓ Image uploaded: ${asset._id}`);
      break;
    } catch (err) {
      console.error(`  ✗ Upload failed:`, err);
    }
  }

  if (!mainImageRef) {
    console.log('Image upload failed — article will be created without mainImage.');
  }

  // ── Op-Ed category ──
  console.log('Finding or creating Op-Ed category...');
  let categoryId: string | null = null;
  const existingCat = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && (slug.current == "op-ed" || title match "Op*Ed" || title match "op-ed")][0]{ _id }`
  );
  if (existingCat) {
    categoryId = existingCat._id;
    console.log(`✓ Found existing category: ${categoryId}`);
  } else {
    const created = await client.create({
      _type: 'category',
      title: 'Op-Ed',
      slug: { _type: 'slug', current: 'op-ed' },
      description: 'Opinion and editorial pieces from contributors and staff.',
    });
    categoryId = created._id;
    console.log(`✓ Created Op-Ed category: ${categoryId}`);
  }

  // ── Justin King author ──
  console.log('Finding Justin King author...');
  const existingAuthor = await client.fetch<{ _id: string } | null>(
    `*[_type == "author" && name == "Justin King"][0]{ _id }`
  );
  const authorId = existingAuthor?._id ?? null;
  console.log(authorId ? `✓ Author found: ${authorId}` : '✗ Justin King not found');

  // ── Check for duplicate ──
  const slug = 'so-i-was-waterboarded';
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (existing) {
    console.log(`⊘ Article already exists: ${existing._id}`);
    return;
  }

  // ── Build article document ──
  const doc: Record<string, unknown> = {
    _type: 'article',
    title: 'So, I was waterboarded…',
    slug: { _type: 'slug', current: slug },
    description:
      'Justin King recounts being voluntarily waterboarded at an Ohio State Courthouse demonstration to refocus public attention on the CIA torture report — a program the four-year Senate investigation found produced "no evidence that terror attacks were stopped, terrorists captured, or lives saved."',
    leadParagraph:
      'Without really thinking about it, I volunteered to be waterboarded. My intention was to refocus attention on the torture program in place by the United States government.',
    keywords: [
      'waterboarding',
      'torture',
      'CIA torture report',
      'Senate Intelligence Committee',
      'National Day of Action Against Torture',
      'Unite Ohio',
      'Derrick Broze',
      'The Anti-Media',
      'Columbus Ohio',
      'civil liberties',
      'protest',
      'PANDA',
      'indefinite detention',
    ],
    publishedAt: '2015-02-02T12:00:00Z',
    location: 'Columbus, OH',
    tags: [
      'waterboarding',
      'torture',
      'cia',
      'civil-liberties',
      'protest',
      'ohio',
      'firsthand-account',
      'op-ed',
    ],
    body,
    methodology:
      "First-person account originally published February 2, 2015 via The Fifth Column (TFC). The demonstration described took place January 31, 2015 at the Ohio State Courthouse. The Senate Intelligence Committee's summary of the CIA's Detention and Interrogation Program was released December 9, 2014.",
    allowComments: true,
    featured: false,
    breakingNews: false,
    needsReview: false,
    faqs: [
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What was the National Day of Action Against Torture?',
        answer:
          "A coordinated series of demonstrations organized by journalist Derrick Broze of The Anti-Media, held on January 31, 2015, to refocus public attention on the Senate Intelligence Committee's summary of the CIA torture report — which had been largely ignored by mainstream media since its December 2014 release.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'How does waterboarding actually work?',
        answer:
          "The victim is positioned at an angle with their feet and lungs above their head. A wet cloth covers the face and mouth, and water is poured through it into the nose and throat. Though no fluid enters the lungs, the body's drowning response triggers an involuntary panic/flight reflex — an instinct that cannot be overcome by willpower.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What happened when the Ohio State Police intervened during the demonstration?',
        answer:
          "An officer pulled King upright mid-session, believing his life was in danger. Rather than be arrested, King used the officer's own words — that a normal person seeing this knows it is dangerous and harmful — to make the demonstration's point to the assembled crowd.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What were the key findings of the CIA torture report?',
        answer:
          '1 in 4 detainees was determined to be innocent; the CIA unknowingly tortured two of its own agents; the program included rectal feeding with no medical justification; detainees\' family members were kidnapped to exert pressure; and a four-year investigation found "no evidence that terror attacks were stopped, terrorists captured, or lives saved."',
      },
    ],
  };

  if (mainImageRef) {
    doc.mainImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: mainImageRef },
      alt: 'Waterboarding illustration from the 2007 U.S. Army Field Manual (public domain)',
    };
  }
  if (authorId) doc.author = { _type: 'reference', _ref: authorId };
  if (categoryId) doc.categories = [{ _type: 'reference', _ref: categoryId }];

  const created = await client.create(doc);
  console.log(`\n✓ Article created: ${created._id}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Blocks: ${body.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
