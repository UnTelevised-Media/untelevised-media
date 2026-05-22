/**
 * scripts/create-ira-article.ts
 * Creates the Justin King article "Profiles in Insurgency: The Irish Republican Army" in Sanity.
 * Run: node_modules/.bin/ts-node --esm scripts/create-ira-article.ts
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

const body = [
  // Introductory note
  block(
    'Introductory note: This article is part of a series profiling different "insurgent" or "terrorist" groups. Care was taken to avoid including any inflammatory language about any organization profiled in the series or the organization\'s opposition. No article in the series should be construed as either supporting or condemning a particular organization. After all, one man\'s terrorist is another man\'s freedom fighter.',
    'blockquote'
  ),

  // Org info block
  block('The Irish Republican Army (IRA)', 'h2'),
  block('Founded: 1922'),
  block('Strength: Roughly 1,000 with tens of thousands of sympathizers worldwide.'),
  block('Structure: Cellular under the command of a council.'),
  block(
    'Financing: Self-financed through bank robberies and kidnappings. Money donated to Irish organizations in the United States is sometimes funneled to the IRA for arms purchases.'
  ),
  block(
    'Goals: In the long term, the IRA seeks to establish a united country encompassing all of the island of Ireland. The short term goal of the organization is usually summed up as "Brits out."'
  ),

  // History section
  block('Major Historical Highlights:', 'h2'),
  block(
    'The modern IRA sprang from the events surrounding the Easter Rising in 1916, when Irish men and women marched into the streets in open defiance of the Crown\'s forces in Ireland. The forces of the United Kingdom quickly put down the rebellion, but the brief open conflict steeled the resolve of nationalists in the country who began a guerrilla war that included bombings, assassinations, and as Michael Collins described it, "general mayhem."'
  ),
  block(
    'By 1921, the guerrilla war succeeded in bringing the British government to the negotiating table, and most of Ireland became the Irish Free State. The treaty granting partial independence was contentious among IRA veterans and a civil war erupted causing the first of many splits in the IRA. The pro-treaty forces eventually won, but the victory left six counties in Northern Ireland still under the control of the United Kingdom.'
  ),
  block(
    'While there were minor elements of insurrection over the next forty years, the IRA became a household term again in 1969 when a riot broke out during a parade. The riot was known as the "Battle of the Bogside," and the riot firmly entrenched the conflict along religious and ethnic lines, with Protestant British Loyalists on one side and Irish Catholic Republicans on the other. These religious and ethnic lines still closely determine an Irish national allegiance to one side or the other. That same year, a major split occurred in the organization and it split into the Irish Republican Army and the Provisional Irish Republican Army (PIRA), better known as the "Provos." The PIRA became the dominant Republican insurgent group in Ireland for the next few decades.'
  ),
  block(
    'The violence that occurred, primarily targeting loyalists and British military, over the next two years led to the British government instituting an internment policy. During the years of internment, more than 2,000 people were held without trial. In retrospect, the policy is likely to have fueled the growth of the Republican groups. In 1972, a public relations nightmare occurred for British forces, when British Paratroopers opened fire on a civil rights march in Derry and killed 13 civilians. The incident is known as "Bloody Sunday."'
  ),
  block(
    'The deaths that occurred on Bloody Sunday increased the brutality of the Republican forces. In July of 1972, the IRA detonated more than two dozen bombs in one night, killing 9 and injuring 130. The bombings are known collectively as "Bloody Friday." The war raged on for another three years before secret negotiations created a truce and internment ended. Though, IRA members were still held liable for the actions they committed during the war.'
  ),
  block(
    'In March of 1976, the British government removed the "special category" status from IRA prisoners. This status in essence treated them like Prisoners of War rather than common criminals. Protests and hunger strikes began. The "Blanket Protest" took place in Maze prison and IRA soldiers refused to wear the prison uniforms of ordinary criminals, instead wrapping themselves in blankets. This was followed two years later by the "Dirty Protest." During the Dirty Protest, IRA prisoners refused to wear normal prison uniforms and smeared feces on the walls of the prisons.'
  ),
  block(
    "In 1979, the IRA took the fight directly to the Royal Family. The organization assassinated the Queen's uncle, Lord Mountbatten, by blowing up his boat."
  ),
  block(
    'The hunger strikes began in 1980, and the most notable participant was Bobby Sands. Even though Sands was confined in a prison cell and literally starving himself to death, he was elected to Parliament. Sands died on May 5th, and 100,000 people attended his funeral. He was followed by nine more IRA members who starved themselves to death trying to obtain "special category" status.'
  ),
  block(
    'In the late 1980s the IRA began receiving weapons from several state-sponsors of terrorism, most notably Libya. Libya provided the IRA with surface-to-air missiles to engage British helicopters. The British Special Air Service killed three unarmed IRA members in Gibraltar in 1988, and a British Loyalist opened fire on the funeral service, killing three more. During the funeral procession of Kevin Brady, one of those gunned down at the funeral, two British soldiers drove into the parade. The soldiers are dragged from the vehicle, beaten, and shot by the IRA. The incident was broadcast around the world.'
  ),
  block(
    'In 1993, the IRA detonates a one ton bomb in London, in an attempt to take the fight the British home soil. Damages exceeded $1 billion US. The rest of the 1990s passed with sporadic violence. In 1998, the "Good Friday Agreement" was passed which was a compromise brokered by politicians associated with the various Republican and Loyalist factions. It was rejected by many of the combatants.'
  ),
  block(
    'In 1998, the Omagh bombing killed 29 people and wounded 200. The blast was linked to a faction of the IRA that did not agree with the terms of the Good Friday Agreement. It should be noted that subsequent investigations revealed those responsible for the bombing repeatedly attempted to get the police to evacuate the area prior to the explosion. The warnings were ignored.'
  ),
  block(
    'The war has been relatively quiet for the last decade, with many attributing the lull in violence to the IRA\'s decision to avoid conflict during the US-led "War on Terror." With the wars winding down, IRA activity has seen a major upswing over the last two years, and continued sectarian violence is likely to lead to a full reemergence of the IRA.'
  ),
  block('This article was originally published by The Anti-Media.'),
];

async function main() {
  console.log('Creating Justin King IRA profile article...\n');

  // ── Justin King author ──
  console.log('Finding or creating Justin King author...');
  let authorId: string | null = null;
  const existingAuthor = await client.fetch<{ _id: string } | null>(
    `*[_type == "author" && name == "Justin King"][0]{ _id }`
  );
  if (existingAuthor) {
    authorId = existingAuthor._id;
    console.log(`✓ Author found: ${authorId}`);
  } else {
    const created = await client.create({
      _type: 'author',
      name: 'Justin King',
      bio: 'Justin King is an investigative journalist, political analyst, and former editor of The Fifth Column (TFC). His work focuses on anarchism, civil liberties, government overreach, and conflict reporting.',
    });
    authorId = created._id;
    console.log(`✓ Author created: ${authorId}`);
  }

  // ── Politics/History category ──
  console.log('Finding or creating Politics category...');
  let categoryId: string | null = null;
  const existingCat = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && (slug.current == "politics" || title match "Polit*")][0]{ _id }`
  );
  if (existingCat) {
    categoryId = existingCat._id;
    console.log(`✓ Found existing category: ${categoryId}`);
  } else {
    const created = await client.create({
      _type: 'category',
      title: 'Politics',
      slug: { _type: 'slug', current: 'politics' },
      description: 'Political analysis, commentary, and reporting.',
    });
    categoryId = created._id;
    console.log(`✓ Created Politics category: ${categoryId}`);
  }

  // ── Duplicate check ──
  const slug = 'profiles-in-insurgency-the-irish-republican-army';
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (existing) {
    console.log(`⊘ Article already exists: ${existing._id}`);
    return;
  }

  // ── Build article document ──
  const doc: Record<string, unknown> & { _type: string } = {
    _type: 'article',
    title: 'Profiles in Insurgency: The Irish Republican Army',
    slug: { _type: 'slug', current: slug },
    description:
      'An objective profile of the Irish Republican Army — its founding, structure, financing, goals, and major historical events from the Easter Rising through the Good Friday Agreement and beyond.',
    leadParagraph:
      "One man's terrorist is another man's freedom fighter. This profile of the Irish Republican Army traces its origins in the 1916 Easter Rising through a century of armed struggle, hunger strikes, and peace negotiations — presented without judgment.",
    keywords: [
      'IRA',
      'Irish Republican Army',
      'Northern Ireland',
      'Provisional IRA',
      'Bloody Sunday',
      'Bloody Friday',
      'Good Friday Agreement',
      'Bobby Sands',
      'Easter Rising',
      'insurgency',
      'terrorism',
      'profiles in insurgency',
      'Justin King',
      'Anti-Media',
    ],
    publishedAt: '2015-01-29T12:00:00Z',
    location: 'Ireland',
    tags: [
      'IRA',
      'ireland',
      'northern-ireland',
      'insurgency',
      'history',
      'politics',
      'profiles-in-insurgency',
      'british-politics',
    ],
    body,
    methodology:
      'Originally published January 29, 2015 via The Anti-Media. Republished with attribution.',
    allowComments: true,
    featured: false,
    breakingNews: false,
    needsReview: false,
    faqs: [
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What was the original goal of the Irish Republican Army?',
        answer:
          'The IRA was founded in 1922 with the long-term goal of establishing a united, independent Ireland encompassing the entire island. Its short-term objective is commonly summarized as "Brits out" — the removal of British rule from Northern Ireland.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What was Bloody Sunday?',
        answer:
          'Bloody Sunday refers to January 30, 1972, when British Paratroopers opened fire on a civil rights march in Derry, killing 13 civilians. The event dramatically escalated IRA recruitment and violence, including the retaliatory bombings of Bloody Friday just months later.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'Who was Bobby Sands and why is he significant?',
        answer:
          'Bobby Sands was an IRA prisoner at Maze Prison who led a hunger strike in 1981 to protest the removal of "special category" (prisoner-of-war) status for IRA inmates. While starving to death, he was elected to the British Parliament. He died on May 5, 1981; 100,000 people attended his funeral. Nine more IRA members died in the same hunger strike.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What was the Good Friday Agreement?',
        answer:
          'The Good Friday Agreement of 1998 was a peace accord brokered between Republican and Loyalist political factions in Northern Ireland, effectively ending most organized IRA violence. It was rejected by many active combatants, and a splinter faction carried out the Omagh bombing — which killed 29 people — later that year.',
      },
    ],
  };

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
