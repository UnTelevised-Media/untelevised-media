/**
 * scripts/create-insurgency-military-article.ts
 * Creates the Justin King analysis "Full Spectrum Operations: How the US Military
 * Would Respond to a Domestic Insurgency" in Sanity.
 * Run: node_modules/.bin/ts-node --esm scripts/create-insurgency-military-article.ts
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
  block(
    "One of the overriding questions when discussing an insurgency within the United States has always been the debate over how the military would respond. Those who hope for the military to break ranks and join the resistance will be disappointed. Those who would believe the military will employ surgical strikes to remove dissidents through technology will be surprised. The American people don't have to guess how the US military would respond any longer. Two respected academics chose to war game a scenario using the United States Operating Concept (2010) as a guide."
  ),
  block(
    "The first thing to understand about an insurrection is that it isn't terrorism. The terms are often used interchangeably by the media, but there is a significant difference."
  ),
  block(
    'As pointed out throughout this series, insurgencies that matured through the cycle of insurgency win. Always. There is a reason for this. Insurgencies, though typically weaker militarily, have great advantages over their adversaries. One of the greatest small unit commanders and unconventional warfare experts in modern times, Richard Marcinko, described three things needed to win in combat: speed, surprise, and violence of action. When transferred to the strategic and operational levels, the insurgency possesses these attributes.'
  ),

  block('Key Advantages of an Insurgency', 'h2'),

  block('Mobility', 'h3'),
  block(
    'The refusal to stay in a static location negates technologically advanced weapons systems.'
  ),

  block('Initiative', 'h3'),
  block('The insurgency is able to choose the time and place of most of the battles they fight.'),

  block('Surprise', 'h3'),
  block(
    'Because the insurgents have the ability to choose the time and place of the fight, they can select moments when the opposition is weakest.'
  ),

  block('Camouflage', 'h3'),
  block(
    'The insurgent does not wear a uniform. As the father of modern insurgency, Michael Collins, said: "Our uniform will be that of the man on the street and the peasant in the field." This makes distinguishing between friend and foe difficult for the opposition.'
  ),

  block('Unpredictability', 'h3'),
  block(
    "A force that is unpredictable on a battlefield is dangerous. Field commanders train to fight conventional wars, in which both sides attempt to take and hold territory — the insurgent seeks destabilization of the opposition's government, not land. Tactics designed to defeat a conventional army are useless against an enemy that doesn't seek to hold territory."
  ),
  block(
    '"Professional soldiers are predictable, but the world is full of amateurs." The implied meaning is that the amateur is more dangerous.',
    'blockquote'
  ),

  block('Factional Divides', 'h3'),
  block(
    "In a conventional military setting, a force should function like a well-oiled machine and have clear command and control. Insurgencies typically operate with loose alliances between factions who follow a particular commander. Sometimes they work together, sometimes they don't. Just when the opposition gains a feel for the tactics and strategy of an insurgent commander, a new one arises. This leads to unpredictable actions being taken by the various factions, which increases their overall effectiveness."
  ),

  block('Civilian Sympathies', 'h3'),
  block(
    "Insurgencies typically maintain a great deal of support from the local populace, which means the opposition can't move without information detailing those moves reaching the insurgents. In a conventional conflict, the lines of battle hinder civilians from collecting intelligence and passing it to the opposing force. Insurgencies have no front lines."
  ),
  block(
    'Insurgencies maintain several other key advantages, but they are more nuanced and are beyond the scope of this article.'
  ),

  block('Full Spectrum Operations in the Homeland', 'h2'),
  block(
    'The US Army has adopted a doctrine of "Full Spectrum Operations." Loosely it means the combination of offensive, defensive, and either stability operations overseas or civil support operations on U.S. soil. It\'s a concept developed for conventional wars, with little application in unconventional conflicts. To produce a desired outcome (a US military win), the scenario has to be carefully crafted. The academics who published Full Spectrum Operations in the Homeland: A "Vision" of the Future were able to accomplish that.'
  ),

  block('The War-Gamed Scenario', 'h2'),
  block(
    "The Great Recession of the early twenty-first century lasts far longer than anyone anticipated. After a change in control of the White House and Congress in 2012, the governing party cuts off all funding that had been dedicated to boosting the economy or toward relief. The United States economy has flatlined, much like Japan's in the 1990s, for the better part of a decade.",
    'blockquote'
  ),
  block(
    "By 2016, the economy shows signs of reawakening, but the middle and lower-middle classes have yet to experience much in the way of job growth or pay raises. Unemployment continues to hover perilously close to double digits, small businesses cannot meet bankers' terms to borrow money, and taxes on the middle class remain relatively high. A high-profile and vocal minority has directed the public's fear and frustration at nonwhites and immigrants. After almost ten years of race-baiting and immigrant-bashing by right-wing demagogues, nearly one in five Americans reports being vehemently opposed to immigration, legal or illegal, and even U.S.-born nonwhites have become occasional targets for mobs of angry whites.",
    'blockquote'
  ),
  block(
    'In May 2016 an extremist militia motivated by the goals of the "tea party" movement takes over the government of Darlington, South Carolina, occupying City Hall, disbanding the city council, and placing the mayor under house arrest. Activists remove the chief of police and either disarm local police and county sheriff departments or discourage them from interfering. In truth, this is hardly necessary. Many law enforcement officials already are sympathetic to the tea party\'s agenda, know many of the people involved, and have made clear they will not challenge the takeover.',
    'blockquote'
  ),
  block(
    'With Darlington under their control, militia members quickly move beyond the city limits to establish "check points" — in reality, something more like choke points — on major transportation lines. Traffic on I-95, the East Coast\'s main north-south artery; I-20; and commercial and passenger rail lines are stopped and searched, allegedly for "illegal aliens." Citizens who complain are immediately detained. Activists also collect "tolls" from drivers, ostensibly to maintain public schools and various city and county programs, but evidence suggests the money is actually going toward quickly increasing stores of heavy weapons and ammunition.',
    'blockquote'
  ),

  block("Why the Scenario Guarantees a Military Win — And Why That's Misleading", 'h2'),
  block(
    'The scenario continues with descriptions of the activities of politicians prior to the military being involved, but the actions of the "insurgent" already guarantee a US military victory. In the presented scenario, the insurgents surrender every single advantage they have. They attempt to hold territory, losing the advantages of mobility, surprise, initiative, and unpredictability. Because they are operating openly and in a defined area, they have lost the advantage of camouflage. The battle lines established by the insurgents themselves at the checkpoints negate the benefits of civilian sympathy. They have a unified command structure that reduces unpredictability.'
  ),
  block(
    'In the scenario, DOD responds to this threat by establishing a "show of force" to demoralize the insurgents. They then mount offensive operations by surprise to take down the checkpoints. Towards the end of the campaign, the military seizes power and radio stations and so on. It then begins mopping up operations once the civilians of Darlington have fled.'
  ),
  block(
    'When faced with the realities of a modern insurgency, this response is completely fictional. There can be no "show of force" to insurgents who don\'t take and hold territory. Because the insurgency would operate in a loosely defined area, it would be the US military setting up checkpoints (as in Iraq) that would be ambushed, not the insurgents. Wise insurgents would use mobile communications to spread their message, not a static radio station. The power stations would have been destroyed to foster a belief in the civilian populace that the government can\'t even keep the lights on, much less defeat the insurgency. The civilians that conveniently remove themselves from the battlefield in the scenario will be in the line of fire during an insurgency because there is no front line. There is nowhere to evacuate to.'
  ),

  block('The Doctrine Is Fundamentally Flawed', 'h2'),
  block(
    'The academics responsible for this scenario specifically created a simple set of conditions that allowed them to explore the logistical aspects of the doctrine on US soil, without considering the real world applications. The US counterinsurgency doctrine is fundamentally flawed. Even when practiced in a foreign country, away from the intense criticism of the US media and populace, it failed to pacify Iraq or Afghanistan. In the US, the doctrine is worthless.'
  ),
  block(
    'In the joint publication on counterinsurgency doctrine used by all branches, even before the table of contents, it spells out the expected failure. On page iii it states:'
  ),
  block(
    '"US counterinsurgency efforts should provide incentives to the host-nation government to undertake reforms that address the root causes of the insurgency."',
    'blockquote'
  ),
  block(
    'In a US-based insurgency, the United States is the "host-nation government." While the above scenario makes for a fun read, current US doctrine is to meet the demands of domestic insurgents, while protecting as much of its credibility as possible.'
  ),
];

async function main() {
  console.log('Creating Justin King domestic insurgency analysis article...\n');

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

  // ── Politics category ──
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
  const slug = 'how-the-us-military-would-respond-to-a-domestic-insurgency';
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
    title: 'How the US Military Would Respond to a Domestic Insurgency',
    slug: { _type: 'slug', current: slug },
    description:
      'Two academics war-gamed a domestic insurgency scenario using US Army doctrine. Their scenario reveals the fundamental flaws in US counterinsurgency strategy — and why a real insurgency would play out very differently.',
    leadParagraph:
      "The American people don't have to guess how the US military would respond to a domestic insurgency. Two respected academics war-gamed exactly that scenario using the United States Operating Concept as a guide — and the results expose the fatal assumptions baked into US counterinsurgency doctrine.",
    keywords: [
      'insurgency',
      'US military',
      'counterinsurgency',
      'Full Spectrum Operations',
      'domestic insurgency',
      'COIN doctrine',
      'unconventional warfare',
      'militia',
      'Justin King',
      'TFC',
      'analysis',
      'civil war',
    ],
    publishedAt: '2015-02-05T12:00:00Z',
    location: 'Washington, DC',
    tags: [
      'insurgency',
      'military',
      'analysis',
      'counterinsurgency',
      'civil-liberties',
      'government',
      'profiles-in-insurgency',
      'us-news',
    ],
    body,
    methodology:
      'Originally published via The Fifth Column (TFC). References the academic paper "Full Spectrum Operations in the Homeland: A \'Vision\' of the Future" and US joint counterinsurgency doctrine. Republished with attribution.',
    allowComments: true,
    featured: false,
    breakingNews: false,
    needsReview: false,
    faqs: [
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What is "Full Spectrum Operations" and why does it matter?',
        answer:
          "Full Spectrum Operations is the US Army's operational doctrine combining offensive, defensive, and stability or civil-support operations. The article argues the doctrine was designed for conventional warfare and is fundamentally inapplicable to a real domestic insurgency, as it assumes insurgents will make every strategic mistake possible.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question:
          'What are the biggest advantages an insurgency has over a conventional military?',
        answer:
          'The article identifies seven key advantages: mobility (no fixed positions to target), initiative (choosing when and where to fight), surprise, camouflage (no uniforms), unpredictability, factional independence (no single chain of command to decapitate), and civilian sympathy (no front lines means intelligence flows freely to the insurgency).',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: "Why does the academics' scenario guarantee a US military victory?",
        answer:
          "The scenario's fictional insurgents surrender every real-world advantage an insurgency would have. They hold fixed territory, operate openly, use a static radio station, maintain unified command, and draw a clear front line — all of which play directly into conventional US military strengths. A competent insurgency would do the opposite.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What does the US counterinsurgency doctrine say the government should do?',
        answer:
          'The joint counterinsurgency publication states that the host-nation government should address the root causes of the insurgency through reform. In a US-based insurgency, the US government is the host-nation — meaning the doctrine itself calls for meeting the political demands of domestic insurgents rather than military suppression.',
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
