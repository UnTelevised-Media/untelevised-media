/**
 * scripts/create-anarchist-article.ts
 * Creates the Justin King op-ed "11 Things Every Anarchist Should Be Doing" in Sanity.
 * Run: node_modules/.bin/ts-node --esm scripts/create-anarchist-article.ts
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
    "(TFC) – Anarchism. It'll happen if we just wish hard enough, right? Or should we begin taking concrete steps to hasten its arrival? If you believe anarchism will suddenly appear as a viable society because we want it to, or because the inevitable collapse of the current unsustainable system will usher it in, you're dismissed. Bringing about an idea as revolutionary as self-government will take work. For many of us, we are probably planting the seeds of a shade tree we will never have the pleasure of sitting under. The process must begin and it must continue. Below is a list of things every anarchist, regardless of hyphen, should begin engaging in.  The activities will speed the arrival of anarchism, or protect you during what will be a turbulent period of adjustment. Below the suggestions are anticipated objections or questions from various schools of thought."
  ),

  block('1. Force Multiply', 'h2'),
  block(
    'One of the key elements in anarchism is self-reliance. In some variations, it may be reliance on the community. Force multiplication is a military concept, but it applies to any other field of endeavor. The theory is the premise by which American Green Berets live. One person teaches ten, who each teach ten, who each teach ten and so on. Eventually, there is a viable resistance force in the country in which they are operating. By the fifth generation of this formula, the skills of the first person are now known by 100,000. Whatever your skill is, teach it. From gardens to guerillas, art to artillery, medicine to mathematics, it is the duty of every anarchist to become a Renessaince man or woman. Every time you teach a new skill, you are creating a better, stronger, more self-reliant anarchist. By extension, you are creating a better, stronger, more self-reliant movement.'
  ),

  block('2. Counter-Economics', 'h2'),
  block(
    "This goes beyond cryptocurrencies and black markets. Any dime you can deprive the powers of the state is a victory. This means buying locally, shopping at thrift stores, or through alternative channels whenever possible. It means lowering your rate of consumption of goods. It means avoiding large multinational chains whenever possible. It won't always be possible. Economics dictates that sometimes your wallet must come before your principles. Repair, reuse, and repurpose anything that's feasible. Starve the economy."
  ),
  block(
    "Anarcho-capitalists: “I happen to find the business practices of Wal-Mart to be a testament to the power of the free market. Why should I stop supporting them?” The profits from your purchases aren't just taxed and thereby provide funding for the state; large multinational corporations pay off government officials at every level through legal campaign contributions or through illegal bribes. Your purchases fund the stranglehold the government has on its people.",
    'blockquote'
  ),

  block('3. Prepare for the Worst', 'h2'),
  block(
    'The transition from a world of nations to a stateless society will not be peaceful. Even if the catalyst for change begins peacefully, the perceived power vacuum will cause someone to step up and attempt to carve out a kingdom. You need to be prepared to defend yourself and your loved ones. Anarchists must prepare for the worst humanity has to offer so that eventually they can bring it the best. This means learning about warfare, not about fighting in the streets with bottles and sticks.'
  ),
  block(
    'Anarcho-pacifists: “This is diametrically opposed to my ideology.” I respect your wishes to die with your ideology intact. For the rest of us, it is imperative that we are capable of violence at a greater level than those who would seek to place us back under the yoke of tyranny.',
    'blockquote'
  ),

  block('4. Get a Job/Start a Business', 'h2'),
  block(
    "Most would agree that anarchists are in a war for the very soul of humanity.  We are attempting to wage that war against thousands of years of the entrenched belief that people require a ruler. Wars cost money. It doesn't matter if it's a spiritual, ideological, or physical war. Money greases the wheels of the war machine. From feeding the homeless to funding direct action, money enables it. Economic self-sufficiency is required to continue the fight."
  ),
  block(
    "Anarcho-communists: “I shouldn't have to pay just to live.” Somebody will have to obtain the funding to achieve the society you want. If not you, who? Also remember that in order for the “workers of the world” to unite, there must be workers.",
    'blockquote'
  ),

  block('5. Teach the Children Quietly', 'h2'),
  block(
    "This is a long game. It won't be won overnight. The next generation of anarchist is more important than the current. Each generation should become better than the last. We must not only encourage free thought and self-reliance in our own children, but we must encourage and give opportunities to the young would-be anarchists. How often have you seen the person just beginning to explore the idea of freedom be mocked for completely explainable ignorance? None of us were born with an innate understanding of freedom, it's a path and it's a long journey. When a newly minted anarchist is met with nothing but derision by those who should be encouraging her, she might abandon the belief. When a fledgling anarchist asks a question and receives nothing but questions about whether or not they've read philosopher x, he might simply vanish. Anarchism is not some esoteric belief system in which only the best and brightest may advance. It is for everyone. We must attempt to mentor those who would fight for freedom."
  ),

  block('6. Look out for the Downtrodden', 'h2'),
  block(
    "It's extremely hard to convince people that anarchism would be anything other than a dog eat dog world when many anarchists refuse to help their neighbor or even seek to persecute the less fortunate. It provides the opposition with all of the ammunition they need to prove to the average person governments are needed to protect them from the evil people waiting to pounce. Economically disadvantaged people should be cared for as much as possible. When anarchists provide services the state should be providing, it demonstrates that social responsibility does not have to be forced through taxation. Prisoners are not only in need but are in a special situation. They are already angry at the state and are quite literally a captive audience. Every effort should be made to reach out to the incarcerated."
  ),
  block(
    "Anarcho-capitalists: “Why should I give additionally when I'm already taxed for these services? #TaxationIsTheft” If you don't, you're allowing the government to use your money and claim credit. However, if you are giving additionally, you can use that as a method of bringing up government inefficiency and the inherent violence of government. Any conversation with the press should include mention of having to pay for the same service twice because the government is corrupt and ineffective.",
    'blockquote'
  ),

  block('7. Stop Being Coopted', 'h2'),
  block(
    'In the last few months, we have witnessed left-leaning anarchists be coopted by the Democratic Party in the United States, and right-leaning anarchists coopted by the Republican Party. Anarchists are literally fighting in the streets while the benefits of the battles go to government entities. End it. Now. There should never be a situation when anarchists are waging war against other anarchists on behalf of the state.'
  ),
  block(
    "Anarcho-communists and anarcho-capitalists: “But they aren't real anarchists!” Are they more anarchistic than the political parties? Or Immigration and Customs Enforcement? Those are now the only entities benefiting from this feud. Meanwhile, anarchists are painted as the criminals in the street only justifying more police presence.",
    'blockquote'
  ),

  block('8. Form Alliances with Non-Anarchists', 'h2'),
  block(
    'All over the country there are small pockets of people who believe government should only exist at the county level. These individuals are natural allies. Most sensible anarchists would agree that in a stateless society local communities would have their own standards and methods of conducting themselves. These minarchists can easily exist in one area while being bordered by anarchist communities.'
  ),
  block(
    "Anarcho-insurrectionists: “All statists must die!” That's wonderful rhetoric, and it's the rhetoric of those who have never seen real violence or taken a life. Cooperation is always better than having another enemy. From a military standpoint, if these local government proponents are to be on one side or the other, wouldn't it be better to have them with anarchists? If they seek to expand their control or become totalitarian, they can be removed at a later date.",
    'blockquote'
  ),

  block('9. Support Balkanization at all Times', 'h2'),
  block(
    'Anarchism is a global game. Failure to create large pockets of anarchist societies across the globe will doom the movement. It may seem counter-intuitive for anarchists to support nationalistic endeavors. However, as noted above, a stateless society will most likely be made up of small communities with their own customs, cultures, and sense of community. Every nation that splits brings us closer to that. So when the Basque wish to separate from Spain, support them. When the Irish wish to leave the UK, support them. When the Kurds want to leave Iraq or Syria, support them. Support any move that creates nations with smaller areas of control.'
  ),
  block(
    'Anarchists in general: “But a lot of nations support other nations breaking up so they can install puppets.” Yes, they do. Because smaller nations are weaker nations. Weaker nations are a stepping stone to no nations.',
    'blockquote'
  ),

  block('10. Stop Fighting With Other Anarchists', 'h2'),
  block(
    "Ansoc vs Anprim, Ancom vs Ancap, well let's be honest. It's everybody vs Ancaps at some point. This infighting creates an easily exploitable rivalry that allows others to coopt the groups. Can you provide any other explanation for anarchists of any sort to be offering to defend US Immigration agents? It's the hatred of Anarcho-communists that led anarcho-capitalists to make such a statement. Remember, no matter what economic system you support, you're an anarchist first. Siding with the state over another anarchist should be the clearest sign that you have been coopted. Remember, there is room for every possible configuration of anarchism without a state."
  ),
  block(
    "Anarcho-communists: “Ancaps believe in a hierarchy! They aren't anarchists!” They want the destruction of the state. That puts them in the anarchist pantheon. Let's apply the Ancom theory, though, and see where it leads. If Ancaps were to establish these geographic monopolies and behave as tyrants, what would happen? Under the Ancom doctrine, the workers would rise up, seize the means of production, and thereby put an end to the anarcho-capitalist menace. It's a fight that can take place later, once the actual opposition has been defeated. Let's also be honest, most self-described Ancaps are not really the titans of industry they think they are.",
    'blockquote'
  ),
  block(
    "Anarcho-capitalists: “NAP, property rights, free markets, and helicopters.”  Under the Ancap doctrine, communism wouldn't be able to compete in a free market. Communes would collapse under their own weight. Why on earth would you waste time fighting a group that under your own belief system would fail to compete and disappear?",
    'blockquote'
  ),
  block(
    "Anarcho-primitivists: “These people aren't real anarchists because they aren't living with nature.” I have to admit, I personally believe the Anprims are the most pure hyphenated form of anarchism. That being said, I'm not giving up running water or central heat and air. Let's be very honest, most Anprims will be dead thirty years after the revolution anyway. Why waste time arguing about which economic system takes over after you're dead?",
    'blockquote'
  ),

  block('11. Be an Anarchist', 'h2'),
  block(
    "Everyday. Think for yourself, live your own life, encourage others, develop self-reliance. Refuse to bow to any authority but your own conscience. The revolution isn't coming, it's here. It's just going to be a long war and the most important battle is taking place every day inside your own mind. You have to live the life of an anarchist to show others it can be done. You are a walking advertisement for anarchism."
  ),
];

async function main() {
  console.log('Creating Justin King anarchist op-ed article...\n');

  // ── Image: Anarchy symbol (Wikimedia Commons, public domain) ──
  console.log('Downloading anarchy symbol image...');
  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Anarchy-symbol.svg/1024px-Anarchy-symbol.svg.png';
  let mainImageRef: string | null = null;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const asset = await client.assets.upload('image', buffer, {
      filename: 'anarchy-symbol.png',
      contentType: 'image/png',
    });
    mainImageRef = asset._id;
    console.log(`✓ Image uploaded: ${asset._id}`);
  } catch (err) {
    console.error('✗ Image upload failed:', err);
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

  // ── Check for duplicate ──
  const slug = '11-things-every-anarchist-should-be-doing';
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
    title: '11 Things Every Anarchist Should Be Doing',
    slug: { _type: 'slug', current: slug },
    description:
      'A practical guide for anarchists of every variety on the concrete steps needed to build a more self-reliant, organized movement — from force multiplication and counter-economics to forming alliances and ending factional infighting.',
    leadParagraph:
      'Bringing about an idea as revolutionary as self-government will take work. For many of us, we are probably planting the seeds of a shade tree we will never have the pleasure of sitting under. The process must begin and it must continue.',
    keywords: [
      'anarchism',
      'anarchist',
      'counter-economics',
      'force multiplication',
      'stateless society',
      'self-reliance',
      'balkanization',
      'ancap',
      'ancom',
      'anprim',
      'op-ed',
      'Justin King',
      'TFC',
    ],
    publishedAt: '2017-05-05T12:00:00Z',
    location: 'United States',
    tags: [
      'anarchism',
      'politics',
      'opinion',
      'self-reliance',
      'counter-economics',
      'philosophy',
      'civil-liberties',
    ],
    body,
    methodology:
      'Originally published May 5, 2017 via The Fifth Column (TFC). Republished with attribution.',
    allowComments: true,
    featured: false,
    breakingNews: false,
    needsReview: false,
    faqs: [
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'What does "force multiplication" mean in the context of anarchism?',
        answer:
          "Force multiplication is a military concept adapted for anarchist organizing. One person teaches ten others a skill, who each teach ten more, creating exponential growth. By the fifth generation, one person's knowledge has reached 100,000 people — building a stronger, more self-reliant movement regardless of the skill involved.",
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'How does counter-economics support anarchist goals?',
        answer:
          'Counter-economics means redirecting spending away from large corporations and state-connected entities. Buying locally, using alternative markets, reducing consumption, and choosing thrift stores over multinational chains all deprive the state of tax revenue and weaken corporate-government ties.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question: 'Why does the author argue anarchists should stop fighting with each other?',
        answer:
          'Internal fighting between factions — Ancom vs Ancap, Anprim vs Ansoc — creates exploitable divisions. The article points out that this infighting has led anarchists to be coopted by state entities and political parties, who harvest the energy of these battles for their own benefit while anarchists are painted as street criminals.',
      },
      {
        _type: 'faqItem',
        _key: makeKey(),
        question:
          'What does "supporting balkanization" mean, and why would anarchists support nationalism?',
        answer:
          'Balkanization means the fragmentation of larger nations into smaller political units. The author argues this is a stepping stone toward stateless societies, since smaller nations have less centralized control. Supporting movements like Basque independence, Irish unification, or Kurdish self-determination advances the anarchist vision of small, self-governing communities.',
      },
    ],
  };

  if (mainImageRef) {
    doc.mainImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: mainImageRef },
      alt: 'Anarchist circle-A symbol',
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
