/**
 * scripts/migrate-ar-articles.ts
 *
 * Migrates 14 archived Anon Resistance News articles from HTML to Sanity CMS.
 * Source: R:\UnTelevised Productions\ar-news-articles\
 *
 * Usage:
 *   pnpm tsx scripts/migrate-ar-articles.ts            -- live run (all articles)
 *   pnpm tsx scripts/migrate-ar-articles.ts --dry-run  -- preview only, no writes
 *   pnpm tsx scripts/migrate-ar-articles.ts --file=terror-attack-on-standing-rock-protectors.html
 *
 * Requirements: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *               SANITY_API_WRITE_TOKEN in .env.local
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { resolve } from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');
const FILE_ARG = process.argv.find((a) => a.startsWith('--file='))?.replace('--file=', '') ?? null;

const ARTICLES_DIR = 'R:\\UnTelevised Productions\\ar-news-articles';
const IMAGES_DIR = path.join(ARTICLES_DIR, 'images');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_WRITE_TOKEN!;

if (!projectId || !dataset || !token) {
  console.error('Missing env vars');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-06-04',
  useCdn: false,
  token,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'image'; filename: string }
  | { kind: 'youtube'; videoId: string }
  | { kind: 'facebook'; url: string };

interface ArticleConfig {
  htmlFile: string;
  tags: string[];
  location: string;
  faqs: Array<{ question: string; answer: string }>;
  /** Override the title extracted from HTML (use when og:title has unescaped quotes) */
  titleOverride?: string;
  /** Insert h2 headings before the first text block that includes matchText */
  sectionInsertions?: Array<{ matchText: string; heading: string }>;
}

// ─── Per-article configuration ────────────────────────────────────────────────

const ARTICLE_CONFIGS: ArticleConfig[] = [
  {
    htmlFile: 'terror-attack-on-standing-rock-protectors.html',
    tags: [
      'standing-rock',
      'nodapl',
      'water-protectors',
      'morton-county',
      'police-brutality',
      'indigenous-rights',
    ],
    location: 'Standing Rock, North Dakota',
    faqs: [
      {
        question: 'What happened at Standing Rock on November 20, 2016?',
        answer:
          'Law enforcement used water cannons, tear gas, rubber bullets, and an LRAD sound cannon against peaceful water protectors in approximately 26-degree Fahrenheit weather, injuring 167 people including three elders and hospitalizing seven.',
      },
      {
        question: 'What is the DAPL and why were people protesting?',
        answer:
          'The Dakota Access Pipeline (DAPL) is an oil pipeline constructed through or near Native American treaty lands. Protesters, known as Water Protectors, opposed it over concerns about water contamination and violations of indigenous rights.',
      },
      {
        question: 'What weapons were used against Water Protectors?',
        answer:
          'Law enforcement deployed water cannons, tear gas (CS gas), rubber bullets, bean bag rounds, stinger grenades, an LRAD (Long Range Acoustic Device), and pepper spray against peaceful protesters in freezing temperatures.',
      },
      {
        question: 'Who organized the resistance at Standing Rock?',
        answer:
          'The resistance was organized across several camps including Oceti Sakowin, Sacred Stone Camp, and Red Warrior Camp, supported by the Standing Rock Sioux Tribe, Cheyenne River Sioux Tribe, and allied organizations worldwide.',
      },
    ],
  },
  {
    htmlFile: 'army-corps-to-evict-nodapl-camp.html',
    tags: [
      'standing-rock',
      'nodapl',
      'army-corps',
      'eviction',
      'water-protectors',
      'indigenous-rights',
    ],
    location: 'Standing Rock, North Dakota',
    faqs: [
      {
        question:
          'Why did the Army Corps of Engineers issue an eviction notice to Standing Rock protesters?',
        answer:
          'The Army Corps issued the notice to clear protesters from federal land north of the Cannonball River, citing safety concerns under 36 CFR § 327.12, ahead of continued Dakota Access Pipeline construction.',
      },
      {
        question: 'What law was used to evict the protesters?',
        answer:
          "The Army Corps invoked 36 CFR § 327.12 — a regulation governing public use of water resource development projects originally designed to protect natural resources and Native treaty rights, creating a stark irony given the protesters' water protection goals.",
      },
      {
        question: 'How did Standing Rock leadership respond to the eviction notice?',
        answer:
          'Standing Rock Sioux Tribe Chairman Dave Archambault II issued a statement that the Tribe was "deeply disappointed" but that their "resolve to protect our water is stronger than ever," and they had no intention of leaving.',
      },
      {
        question: 'What preparations did the Oceti Sakowin camp make in response to the eviction?',
        answer:
          'Despite the eviction notice, camp residents continued winterizing structures, installing roofs, and receiving $30,000 in donated building materials. Veterans across the US organized to self-deploy to protect the camp, with actions planned for December 4-7.',
      },
    ],
    sectionInsertions: [
      { matchText: '36 CFR § 327.12', heading: 'The Law Being Used to Evict the Camp' },
      {
        matchText: 'Cannon Ball, N.D. — The following statement',
        heading: "Standing Rock's Response",
      },
      { matchText: 'A closer look at the law', heading: 'A Closer Look at the Law' },
      { matchText: 'What can you do to help', heading: 'What Can You Do?' },
      { matchText: 'How to donate to Standing Rock', heading: 'How to Donate to Standing Rock' },
    ],
  },
  {
    htmlFile: 'arm-live-in-baton-rouge.html',
    tags: [
      'baton-rouge',
      'alton-sterling',
      'police-brutality',
      'protests',
      'surveillance',
      'black-lives-matter',
    ],
    location: 'Baton Rouge, Louisiana',
    faqs: [
      {
        question: 'Who is Alton Sterling and why was he significant?',
        answer:
          'Alton Sterling was a Black man shot and killed by Baton Rouge police officers Howie Lake II and Blane Salamoni on July 5, 2016, while selling CDs outside a convenience store. His death sparked widespread protests across Baton Rouge and the nation.',
      },
      {
        question: 'What video jamming technology did Baton Rouge PD use?',
        answer:
          'On July 12, 2016, Radical Edward documented technology used by the Baton Rouge Police Department that appeared designed to prevent live streaming of protests — potentially a cell signal jammer or stingray device.',
      },
      {
        question: 'Where did the Alton Sterling shooting occur?',
        answer:
          'Alton Sterling was shot and killed at the Triple-S convenience store in Baton Rouge, Louisiana. Radical Edward later visited and livestreamed from that location on July 13th, providing community perspective.',
      },
      {
        question: 'How many people were arrested during the Baton Rouge protests?',
        answer:
          'Hundreds of protesters were arrested over the July 9th and 11th protests in Baton Rouge following the killing of Alton Sterling.',
      },
    ],
    sectionInsertions: [{ matchText: 'July 13th', heading: 'July 13th, 2016' }],
  },
  {
    htmlFile: 'as-yet-another-pipeline-explodes,-we-must-ask-when-is-enough,-enough.html',
    tags: ['pipeline', 'fossil-fuels', 'environmental', 'direct-action', 'nodapl', 'dapl'],
    location: 'Smithville, Missouri',
    faqs: [
      {
        question: 'What pipeline exploded near Kansas City in November 2016?',
        answer:
          'A pipeline owned by Mid-America Pipeline Co LLC (a shell company of Louisiana-based Enterprise Products Partners) exploded near Smithville, MO on November 29, 2016, carrying liquid propane and ethane gas. Flames were visible from I-29 and Kansas City International Airport.',
      },
      {
        question: 'Were there any injuries from the Smithville pipeline explosion?',
        answer:
          'No injuries or major environmental damage were reported, as the explosion occurred roughly a half mile from the nearest home. Crews shut off valves to stop gas flow and the blaze burned itself out.',
      },
      {
        question: 'How many pipeline spills has the EPA documented?',
        answer:
          'The EPA documented 6,763 pipeline spills in just four years, causing $7 billion in damages, demonstrating that fossil fuel pipeline infrastructure carries significant and recurring risks to communities and the environment.',
      },
      {
        question: 'What direct actions have people taken against fossil fuel pipelines?',
        answer:
          'Activists worldwide have engaged in boycotts, direct action blockades, legal challenges, and divestment campaigns against oil giants. The Standing Rock resistance and other pipeline protests represent a growing movement against fossil fuel extraction.',
      },
    ],
  },
  {
    htmlFile: 'death-of-kurdish-teen-fighter-sparks-debate.html',
    tags: ['kurdish', 'ypj', 'ypg', 'isis', 'syria', 'media-criticism', 'women-fighters'],
    location: 'Northern Syria',
    faqs: [
      {
        question: 'Who was Viyan Antar?',
        answer:
          'Viyan Antar was a 19-year-old Kurdish fighter who was killed fighting Islamic State forces in Northern Syria. Western media dubbed her the "Kurdish Angelina Jolie" — a characterization that drew fierce criticism for reducing her to her appearance.',
      },
      {
        question: "What debates did Viyan Antar's death spark?",
        answer:
          "Her death ignited debates about the sexualization of women fighters by Western media, Western military intervention in Syria, and the ethics of using a fighter's death to advance political agendas rather than honoring her sacrifice.",
      },
      {
        question: 'What are the YPJ and YPG?',
        answer:
          "The YPJ (Women's Protection Units) and YPG (People's Protection Units) are Kurdish military forces fighting ISIS in Syria and defending Rojava — the Kurdish autonomous region in northern Syria based on principles of direct democracy, gender equality, and ecological sustainability.",
      },
      {
        question:
          'How did Western media coverage of Kurdish fighters differ from coverage of Western soldiers?',
        answer:
          "Western media gave extensive coverage to Kurdish women fighters' physical appearance and romantic lives, while similar attention would never be paid to Western soldiers. The coverage was criticized for objectifying women who were fighting for a philosophy that explicitly rejects the objectification and sexualization of women.",
      },
    ],
    sectionInsertions: [
      { matchText: 'sexualization of a fighter', heading: 'The Sexualization Debate' },
      { matchText: 'Western media', heading: 'Media Coverage and Western Narratives' },
    ],
  },
  {
    htmlFile: 'exclusive-interview-with-s1ege-gsh-opsilence.html',
    tags: [
      'anonymous',
      'hacktivism',
      'operation-silence',
      'ghost-squad',
      'cnn',
      'operation-israel',
    ],
    location: 'Online',
    faqs: [
      {
        question: 'What is Operation Silence?',
        answer:
          "Operation Silence was a hacking operation launched by Ghost Squad Hackers that defaced multiple websites and took down CNN's main website for over 24 hours, targeting media organizations accused of bias and complicity in Israeli operations against Palestine.",
      },
      {
        question: 'Who is s1ege of Ghost Squad Hackers?',
        answer:
          's1ege is a spokesperson for Ghost Squad Hackers, a group connected to Anonymous operations including Operation Israel (#OpIsrael), which targets Israeli government and related websites in solidarity with Palestine.',
      },
      {
        question: 'What happened during the Ghost Squad and Anon Ghost split?',
        answer:
          'According to s1ege, a significant portion of the Anon Ghost collective left over internal disagreements, prompting Ghost Squad Hackers to redirect focus toward media organizations rather than purely Israeli government targets.',
      },
      {
        question: 'What IDF information did Ghost Squad Hackers release?',
        answer:
          'Ghost Squad Hackers released a massive dox (personal information dump) of IDF (Israeli Defense Force) soldiers earlier in 2016 as part of their Operation Israel activities.',
      },
    ],
  },
  {
    htmlFile: 'failed-coup-in-turkey.html',
    tags: ['turkey', 'erdogan', 'coup', 'gulen', 'false-flag', 'fascism', 'kurdistan'],
    location: 'Istanbul, Turkey',
    faqs: [
      {
        question: 'What happened during the 2016 Turkish coup attempt?',
        answer:
          'On July 15-16, 2016, a faction of the Turkish military attempted a coup against President Erdoğan. The coup failed within hours, after which Erdoğan used the event to consolidate power, declaring a state of emergency and arresting nearly 3,000 soldiers.',
      },
      {
        question: 'Who is Fethullah Gulen and why was he accused of involvement?',
        answer:
          'Fethullah Gulen is a Turkish Islamic cleric living in self-imposed exile in Pennsylvania. Erdoğan accused him of masterminding the coup attempt. Turkey demanded his extradition from the US, which Gulen denied any involvement.',
      },
      {
        question: 'Why do some analysts believe the 2016 Turkish coup was a false flag?',
        answer:
          'Analysts cite the coup\'s poor coordination, evidence Erdoğan was tipped off in advance, the speed with which prepared arrest lists were executed, and Erdoğan\'s description of it as "a gift from God" as indicators that the event may have been staged or allowed to unfold.',
      },
      {
        question: 'What violence occurred against minorities in the wake of the coup?',
        answer:
          'Following the coup, AKP supporters took to the streets and targeted minorities in Istanbul. There were reports of fascist violence, with nationalist mobs attacking Kurdish communities and others perceived as political enemies of Erdoğan.',
      },
    ],
  },
  {
    htmlFile: 'iww-organizes-first-ever-prison-strike.html',
    tags: [
      'iww',
      'prison-strike',
      'prison-labor',
      'slavery',
      'attica',
      'labor-rights',
      'mass-incarceration',
    ],
    location: 'United States',
    faqs: [
      {
        question: 'What is the IWW prison strike?',
        answer:
          'The Industrial Workers of the World (IWW) organized a nationwide prison strike on the 45th anniversary of the Attica Prison Uprising. Prisoners in 29 facilities refused to work in protest of prison slave labor conditions, with a new wave of strikes beginning October 15, 2016.',
      },
      {
        question: 'Why is prison labor considered a form of slavery?',
        answer:
          'The 13th Amendment abolished slavery "except as a punishment for crime." This constitutional exception allows prisons to compel inmate labor — often for cents per hour supplied to corporations — which critics including the IWW call modern-day slavery.',
      },
      {
        question: 'Why did the media largely ignore the prison strike?',
        answer:
          'Despite affecting 29 prisons in a coordinated nationwide action, the prison strike received virtually no mainstream media coverage. The media silence was highlighted as part of the broader pattern of ignoring issues affecting incarcerated people.',
      },
      {
        question: 'What was unique about the Alabama prison guard strike?',
        answer:
          'In a historic development, Alabama prison guards joined prisoners in a work stoppage, refusing to report to work in solidarity. This cross-class action between guards and prisoners was unprecedented in US prison history.',
      },
    ],
  },
  {
    htmlFile: 'leaked-video-from-2015-us-gov-wants-you-to-forget.html',
    tags: [
      'john-mccain',
      'ukraine',
      'isis',
      'cyberberkut',
      'false-flag',
      'deep-state',
      'neo-nazis',
    ],
    location: 'Ukraine / Washington D.C.',
    faqs: [
      {
        question:
          "What did the CyberBerkut hackers claim to find on John McCain's staffer's device?",
        answer:
          'The Ukrainian hacktivist group CyberBerkut claimed to find what appeared to be ISIS execution videos being filmed in front of a green screen, suggesting they were staged productions potentially connected to US government intelligence operations.',
      },
      {
        question: 'Who is CyberBerkut?',
        answer:
          "CyberBerkut is a Ukrainian hacktivist group that targeted US officials during John McCain's 2014 visit to Ukraine, where he was meeting with groups involved in the Ukrainian political crisis and coup.",
      },
      {
        question: 'What was John McCain doing in Ukraine in 2014?',
        answer:
          "Senator John McCain visited Ukraine in 2014 to meet with U.S.-backed groups connected to the Ukrainian political crisis that began in April 2014. His visit was controversial and led to the CyberBerkut hack of his staffers' devices.",
      },
      {
        question: 'What questions were raised about ISIS execution videos?',
        answer:
          'Multiple researchers and internet users had long claimed that ISIS execution videos appeared to be staged. The Pentagon later confirmed that fake terrorist videos were produced, raising questions about who was behind them and for what purpose.',
      },
    ],
    sectionInsertions: [
      { matchText: 'Since 2014 the Islamic State', heading: 'The Leaked Video' },
      { matchText: 'John McCain made a trip', heading: "McCain's Ukraine Connection" },
    ],
  },
  {
    htmlFile: 'mcsd-removes-facebook-page.html',
    tags: [
      'morton-county',
      'standing-rock',
      'facebook',
      'censorship',
      'nodapl',
      'police-brutality',
    ],
    location: 'Morton County, North Dakota',
    faqs: [
      {
        question: "Why did the Morton County Sheriff's Department remove their Facebook page?",
        answer:
          "The MCSD Facebook page was removed on or around November 26, 2016, likely to scrub evidence of their actions against Water Protectors and prevent activists from documenting contradictions between MCSD's statements and livestream footage of events.",
      },
      {
        question: 'Who is Sheriff Gary Schwartzenberger?',
        answer:
          "Gary Schwartzenberger was suspended as Morton County Sheriff in connection with events surrounding the Standing Rock protests. His department's handling of Water Protectors drew national and international criticism for excessive force.",
      },
      {
        question: 'What was being documented on the MCSD Facebook page?',
        answer:
          "Activists had been using the MCSD Facebook page comments to document contradictions between the department's public statements and footage from livestreams, as well as sharing evidence of alleged excessive force, lies, and propaganda about events at Standing Rock.",
      },
      {
        question: 'How to donate to Standing Rock Sioux Tribe?',
        answer:
          'You can donate to the Standing Rock Sioux Tribe at standingrock.org, or via mail to: Standing Rock Sioux Tribe, Attention: Donations, PO Box D, Building #1, North Standing Rock Avenue, Fort Yates, ND 58538.',
      },
    ],
  },
  {
    htmlFile: 'op-icarus-phase-3-project-mayhem.html',
    tags: [
      'anonymous',
      'operation-icarus',
      'banking',
      'hacktivism',
      'project-mayhem',
      'stock-exchange',
    ],
    location: 'Global',
    faqs: [
      {
        question: 'What is Operation Icarus?',
        answer:
          "Operation Icarus is an Anonymous operation targeting global banking systems and stock exchanges. Launched in waves, it aims to disrupt financial infrastructure as a statement against the banking system's control over governments and populations.",
      },
      {
        question: 'What is Project Mayhem in relation to Op Icarus?',
        answer:
          'Project Mayhem is the name given to Phase 3 of Operation Icarus, launched June 2016. It references both a 2012 Anonymous operation and the Hollywood film Fight Club, targeting global stock exchanges with coordinated DDoS attacks.',
      },
      {
        question: 'Which financial institutions were targeted by Op Icarus Phase 3?',
        answer:
          'Phase 3 targeted global stock exchanges worldwide. The operation was framed as part of a broader philosophical movement against financial systems that Anonymous argues have captured governments and strip freedoms from populations.',
      },
      {
        question: 'What is the philosophical message behind Operation Icarus?',
        answer:
          'The Operation Icarus manifesto carries themes of transcendentalism and radical freedom, arguing that humanity is at an evolutionary crossroads and that the global banking system must be challenged for true freedom to exist.',
      },
    ],
  },
  {
    htmlFile: 'podesta-wetworks-email-leak.html',
    tags: ['wikileaks', 'podesta', 'scalia', 'clinton', 'deep-state', 'assassination'],
    location: 'Washington D.C.',
    faqs: [
      {
        question: 'What is the "wetworks" Podesta email?',
        answer:
          'The email was sent from John Podesta to lobbyist Steve Elmendorf, referencing "wetworks" — a term meaning assassination or the spilling of blood — three days before Supreme Court Justice Antonin Scalia died under disputed circumstances at a Texas ranch.',
      },
      {
        question: 'Who is John Podesta?',
        answer:
          "John Podesta was Hillary Clinton's 2016 presidential campaign chairman. His emails were leaked by WikiLeaks during the campaign in a series of data dumps that became a major controversy in the election.",
      },
      {
        question: "What are the disputed circumstances around Justice Scalia's death?",
        answer:
          'Justice Scalia died in February 2016 at a private ranch in Texas. Controversies include: no autopsy was ordered, a pillow was reportedly found over his face, questions arose about who controlled access to the scene, and the local justice of the peace ruled by phone without visiting.',
      },
      {
        question: 'Who is Steve Elmendorf?',
        answer:
          'Steve Elmendorf is a major Washington D.C. lobbyist and Democratic Party operative. He served as chief of staff to House Minority Leader Dick Gephardt and has represented numerous corporate clients.',
      },
    ],
  },
  {
    htmlFile: 'redcult-opaqsa.html',
    titleOverride:
      'Anonymous Redcult Takes Down Israeli Sites As A "Gentle Reminder" To Respect Muslim Holiday, #OpAqsa #OpIsrael Continues',
    tags: [
      'anonymous',
      'operation-israel',
      'al-aqsa',
      'palestine',
      'redcult',
      'hacktivism',
      'eid',
    ],
    location: 'Palestine / Global',
    faqs: [
      {
        question: 'What is Operation Al-Aqsa (#OpAqsa)?',
        answer:
          '#OpAqsa is a component of #OpIsrael in which the Anonymous group Redcult targeted 41 Israeli government websites as a "gentle reminder" to respect the Muslim holiday of Eid al-Adha, celebrated at the Al-Aqsa Mosque in occupied Jerusalem.',
      },
      {
        question: 'What is Eid al-Adha?',
        answer:
          'Eid al-Adha, the "Feast of Sacrifice," is the second most important holiday in the Muslim calendar, celebrated over four days. It is deeply connected to the Al-Aqsa Mosque in Jerusalem, which is the third holiest site in Islam.',
      },
      {
        question: 'How many Israeli websites did Redcult target?',
        answer:
          'Redcult announced they had taken down 41 Israeli government websites as part of #OpAqsa, releasing a full list of the affected domains.',
      },
      {
        question: 'What is the historical significance of the Al-Aqsa Mosque?',
        answer:
          'The Al-Aqsa Mosque compound (Temple Mount/Haram al-Sharif) in Jerusalem is the third holiest site in Islam and has been the site of recurring violence and political tension between Israeli forces and Palestinian worshippers, particularly during Muslim holidays.',
      },
    ],
  },
  {
    htmlFile: 'unified-city-project.html',
    tags: [
      'agorism',
      'community-organizing',
      'direct-action',
      'counter-economics',
      'anarchism',
      'mutual-aid',
    ],
    location: 'United States',
    faqs: [
      {
        question: 'What is the Unified City Project?',
        answer:
          'The Unified City Project is a community organizing strategy based on counter-economics (agorism), affinity groups, and mutual aid networks to build parallel economies and community structures that operate outside the existing corrupt system.',
      },
      {
        question: 'What is agorism?',
        answer:
          'Agorism is a libertarian anarchist philosophy advocating building alternative markets and community systems outside of government and corporate control, as a way to make existing power structures obsolete rather than directly fighting them.',
      },
      {
        question: 'What are "freedom cells" as discussed in the article?',
        answer:
          'Freedom cells are small, autonomous groups who organize for mutual aid, shared resources, and community self-governance, forming resilient community networks independent of centralized government control.',
      },
      {
        question: "How does the Unified City Project relate to Buckminster Fuller's philosophy?",
        answer:
          'The article opens with Fuller\'s famous quote: "You never change things by fighting the existing reality. To change something, build a new model that makes the existing model obsolete." The Unified City Project is a practical application of this philosophy.',
      },
    ],
  },
];

// ─── Navigation image patterns to skip ───────────────────────────────────────

const NAV_IMAGE_PATTERNS = [
  'arm news hd',
  'arm banner site final',
  'black cat with tophat',
  'black cat with',
  'technology.svg',
  'technology_poster',
  'facebook-logo',
  'social-media-3',
  'social-media-4',
  'social-media-5',
  'google-plus-symbol',
  'youtube-rounded-square',
  'paypal',
  'bitcoin-coin',
  'operation news',
  'sector news',
  'global news',
  'resistance-red',
  'humanitarian-red',
  'ideology-red',
  'technology-red',
  'deep state-red',
  'arm in the streets',
  'opnodapl yellow red',
  'anonresist logo',
  'anon resistance news.png',
  'favicon',
  'dark red',
  'ag logo',
  'agorism',
];

function isNavImage(src: string): boolean {
  const decoded = decodeURIComponent(src).toLowerCase().replace(/%20/g, ' ');
  return NAV_IMAGE_PATTERNS.some((p) => decoded.includes(p.toLowerCase()));
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function decodeHtmlEntities(text: string): string {
  return (
    text
      // Named entities
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .replace(/&lsquo;/g, '‘')
      .replace(/&rsquo;/g, '’')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      // Hex numeric entities (e.g. &#xD; &#xA;)
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
        const cp = parseInt(hex, 16);
        // Skip control chars (CR, LF, etc.) — replace with space
        return cp < 32 ? ' ' : String.fromCodePoint(cp);
      })
      // Decimal numeric entities
      .replace(/&#(\d+);/g, (_, dec) => {
        const cp = parseInt(dec, 10);
        return cp < 32 ? ' ' : String.fromCodePoint(cp);
      })
  );
}

function stripTags(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function extractMeta(html: string, name: string): string {
  const patterns = [
    new RegExp(`property="${name}"[^>]+content="([^"]*)"`, 'i'),
    new RegExp(`content="([^"]*)"[^>]+property="${name}"`, 'i'),
    new RegExp(`name="${name}"[^>]+content="([^"]*)"`, 'i'),
    new RegExp(`content="([^"]*)"[^>]+name="${name}"`, 'i'),
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) return decodeHtmlEntities(m[1]);
  }
  return '';
}

function parseDate(raw: string): string {
  const months: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    sept: '09',
    october: '10',
    november: '11',
    december: '12',
  };
  const yearM = raw.match(/(\d{4})/);
  const year = yearM ? yearM[1] : '2016';
  let month = '01';
  for (const [name, num] of Object.entries(months)) {
    if (raw.toLowerCase().includes(name)) {
      month = num;
      break;
    }
  }
  const dayM = raw.match(/(\d+)(?:st|nd|rd|th)/);
  const day = dayM ? dayM[1].padStart(2, '0') : '01';
  return `${year}-${month}-${day}T12:00:00Z`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
    .trim()
    .substring(0, 96)
    .replace(/-+$/, ''); // strip trailing hyphens after truncation
}

// ─── Key generation ───────────────────────────────────────────────────────────

let _keyCounter = 0;
function makeKey(): string {
  return `k${(++_keyCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Body parsing ─────────────────────────────────────────────────────────────

function extractBodyBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Find body range: after ShareThis buttons, before FB comments / ARM donation
  const shareThisPos = html.lastIndexOf('st_email_hcount');
  const startPos = shareThisPos !== -1 ? shareThisPos : 0;

  const fbCommentsPos = html.indexOf('class="fb-comments"');
  const donateArmPos = html.indexOf('Donate to Anon Resistance');
  const endPos = Math.min(
    fbCommentsPos !== -1 ? fbCommentsPos : html.length,
    donateArmPos !== -1 ? donateArmPos : html.length
  );

  const bodyHtml = html.substring(startPos, endPos);

  // Find all block markers in position order
  const allMarkers: Array<{ pos: number; kind: string }> = [];
  for (const m of bodyHtml.matchAll(/<!-- content -->/g))
    allMarkers.push({ pos: m.index!, kind: 'content' });
  for (const m of bodyHtml.matchAll(/<!-- image -->/g))
    allMarkers.push({ pos: m.index!, kind: 'image' });
  for (const m of bodyHtml.matchAll(/<!-- custom html -->/g))
    allMarkers.push({ pos: m.index!, kind: 'custom' });
  allMarkers.sort((a, b) => a.pos - b.pos);

  for (let i = 0; i < allMarkers.length; i++) {
    const { pos, kind } = allMarkers[i];
    const nextPos = i < allMarkers.length - 1 ? allMarkers[i + 1].pos : bodyHtml.length;
    const section = bodyHtml.substring(pos, nextPos);

    if (kind === 'content') {
      // Collect all h2 headings
      for (const m of section.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)) {
        const text = stripTags(m[1]);
        if (text) blocks.push({ kind: 'h2', text });
      }

      // Collect paragraphs, skipping nav-only or empty ones
      const paragraphs: string[] = [];
      for (const m of section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
        const text = stripTags(m[1]);
        if (!text || text === ' ') continue;
        paragraphs.push(text);
      }

      if (paragraphs.length === 0) continue;

      const joined = paragraphs.join(' ');

      // Skip: article title (matches og:title)
      const ogTitle = extractMeta(html, 'og:title');
      if (ogTitle && joined.trim() === ogTitle.trim()) continue;

      // Skip: hashtag-only blocks
      const allHashtags = paragraphs.every((p) => /^#\w/.test(p.trim()));
      if (allHashtags) continue;

      // Skip: byline block (starts with "By:")
      if (paragraphs[0].trim().startsWith('By:') || paragraphs[0].trim().startsWith('By '))
        continue;

      // Skip: ShareThis widget text
      if (joined.includes('ShareThis') || joined.includes('displayText=')) continue;

      // Skip: ARM donation widget text only
      if (joined.includes('14WDzkNAFfJ1XwzAnuUfUDwTTHNvWAfAuV') && paragraphs.length === 1)
        continue;

      // Skip: Sabo Lulzy / inquiry bar text
      if (joined.includes('Sabo Lulzy')) continue;

      for (const p of paragraphs) {
        blocks.push({ kind: 'text', text: p });
      }
    } else if (kind === 'image') {
      const imgMatch = section.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        const src = imgMatch[1];
        if (!isNavImage(src)) {
          const filename = decodeURIComponent(src.replace(/^images\//, '').replace(/\?.*$/, ''));
          blocks.push({ kind: 'image', filename });
        }
      }
    } else if (kind === 'custom') {
      const iframeMatch = section.match(/<iframe[^>]+src="([^"]+)"/i);
      if (!iframeMatch) continue;
      const src = iframeMatch[1];

      if (src.includes('youtube.com/embed/')) {
        const videoId = src.replace('https://www.youtube.com/embed/', '').split(/[?/]/)[0];
        if (videoId) blocks.push({ kind: 'youtube', videoId });
      } else if (src.includes('facebook.com/plugins/')) {
        const hrefMatch = src.match(/href=(https?%3A%2F%2F[^&"]+)/i);
        if (hrefMatch) {
          try {
            const url = decodeURIComponent(hrefMatch[1]);
            blocks.push({ kind: 'facebook', url });
          } catch {
            /* skip */
          }
        }
      }
      // vimeo / democracynow / etc. — not supported by the schema, skip silently
    }
  }

  return blocks;
}

function extractSourceUrls(html: string): Array<{ label: string; url: string }> {
  // Find the Sources section
  const sourceStart = Math.max(
    html.indexOf('>Sources:<'),
    html.indexOf('>Sources:</'),
    html.indexOf('id="u6836">Sources:'),
    html.indexOf('id="u6909">Sources:'),
    html.indexOf('"Sources:"')
  );
  if (sourceStart === -1) return [];

  const sourceHtml = html.substring(sourceStart, sourceStart + 6000);
  const sources: Array<{ label: string; url: string }> = [];
  const seen = new Set<string>();

  // href links
  for (const m of sourceHtml.matchAll(/href="(https?:\/\/[^"]+)"/gi)) {
    const url = m[1].replace(/\/$/, '');
    if (!seen.has(url) && isSourceUrl(url)) {
      seen.add(url);
      sources.push({ label: urlToLabel(url), url });
    }
  }

  // Plain-text URLs
  for (const m of sourceHtml.matchAll(/https?:\/\/[^\s<"&)]+/g)) {
    const url = m[0].replace(/[.,;)]+$/, '');
    if (!seen.has(url) && isSourceUrl(url)) {
      seen.add(url);
      sources.push({ label: urlToLabel(url), url });
    }
  }

  return sources;
}

function isSourceUrl(url: string): boolean {
  const skip = [
    'anonresistance.com',
    'AnonResistanceMovement',
    'AnonyResistance',
    'facebook.com/AnonResist',
    'gofundme.com/redwarrior',
    'nodaplsolidarity.org',
    'sacredstonecamp.org',
    'standingrock.org',
    'paypal.me/Anon',
    'bitcoin:',
  ];
  return !skip.some((s) => url.includes(s));
}

function urlToLabel(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/+$/, '').substring(0, 80);
  } catch {
    return url.substring(0, 80);
  }
}

function extractByline(html: string): { author: string; dateRaw: string } {
  // Look for By: pattern
  const byMatch = html.match(/By:\s*([^\n<"]+?)(?:<|\\n|\s{2,})/);
  const author = byMatch ? byMatch[1].trim().replace(/^-+/, '').trim() : 'Anon Resistance';

  // Look for date patterns near the byline
  const datePatterns = [
    /(?:January|February|March|April|May|June|July|August|September|October|November|December|Sept)\s+\d{1,2}(?:st|nd|rd|th)?[-–]?\d*(?:st|nd|rd|th)?,?\s*\d{4}/gi,
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
  ];
  let dateRaw = '2016';
  for (const pat of datePatterns) {
    const m = html.match(pat);
    if (m) {
      dateRaw = m[0];
      break;
    }
  }
  return { author, dateRaw };
}

function extractHashtags(html: string): string[] {
  const tags: Set<string> = new Set();
  for (const m of html.matchAll(/#([A-Za-z]\w{1,39})/g)) {
    const tag = m[1]
      .toLowerCase()
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    tags.add(tag);
  }
  return [...tags].slice(0, 20);
}

// ─── Section heading injection ────────────────────────────────────────────────

function injectSectionHeadings(
  blocks: ContentBlock[],
  insertions: Array<{ matchText: string; heading: string }>
): ContentBlock[] {
  if (!insertions || insertions.length === 0) return blocks;

  const result: ContentBlock[] = [];
  const injected = new Set<string>();

  for (const block of blocks) {
    if (block.kind === 'text') {
      for (const ins of insertions) {
        if (
          !injected.has(ins.heading) &&
          block.text.toLowerCase().includes(ins.matchText.toLowerCase())
        ) {
          result.push({ kind: 'h2', text: ins.heading });
          injected.add(ins.heading);
          break;
        }
      }
    }
    result.push(block);
  }

  return result;
}

// ─── Sanity document builders ─────────────────────────────────────────────────

function buildPortableText(blocks: ContentBlock[], imageRefs: Map<string, string>): unknown[] {
  const pts: unknown[] = [];

  for (const block of blocks) {
    if (block.kind === 'h2') {
      pts.push({
        _type: 'block',
        _key: makeKey(),
        style: 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: makeKey(), text: block.text, marks: [] }],
      });
    } else if (block.kind === 'text') {
      if (!block.text.trim()) continue;
      pts.push({
        _type: 'block',
        _key: makeKey(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: makeKey(), text: block.text, marks: [] }],
      });
    } else if (block.kind === 'image') {
      const assetRef = imageRefs.get(block.filename.toLowerCase());
      if (assetRef) {
        pts.push({
          _type: 'image',
          _key: makeKey(),
          asset: { _type: 'reference', _ref: assetRef },
          alt: block.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        });
      } else {
        console.warn(`  ⚠  No asset ref for image: ${block.filename}`);
      }
    } else if (block.kind === 'youtube') {
      pts.push({ _type: 'youtubeEmbed', _key: makeKey(), videoId: block.videoId });
    } else if (block.kind === 'facebook') {
      pts.push({ _type: 'facebookEmbed', _key: makeKey(), postUrl: block.url });
    }
  }

  return pts;
}

// ─── Image uploading ──────────────────────────────────────────────────────────

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
  };
  return map[ext] ?? 'application/octet-stream';
}

async function uploadImages(filenames: string[]): Promise<Map<string, string>> {
  const refs = new Map<string, string>();
  const unique = [...new Set(filenames.map((f) => f.toLowerCase()))];

  for (const filename of unique) {
    // Try exact match, then case-insensitive search
    let imagePath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(imagePath)) {
      const all = fs.readdirSync(IMAGES_DIR);
      const found = all.find((f) => f.toLowerCase() === filename.toLowerCase());
      if (found) imagePath = path.join(IMAGES_DIR, found);
      else {
        console.warn(`  ⚠  Image not found: ${filename}`);
        continue;
      }
    }

    if (DRY_RUN) {
      refs.set(filename.toLowerCase(), `dry-run-ref-${filename}`);
      continue;
    }

    try {
      const stream = fs.createReadStream(imagePath);
      const asset = await client.assets.upload('image', stream, {
        filename,
        contentType: getMimeType(filename),
      });
      refs.set(filename.toLowerCase(), asset._id);
      console.log(`  ✓ Uploaded: ${filename} → ${asset._id}`);
    } catch (err) {
      console.error(`  ✗ Failed to upload ${filename}:`, err);
    }
  }

  return refs;
}

// ─── Author management ────────────────────────────────────────────────────────

const authorCache = new Map<string, string>();

async function getOrCreateAuthor(name: string): Promise<string | null> {
  const cleanName = name.replace(/^-+/, '').trim();
  if (authorCache.has(cleanName)) return authorCache.get(cleanName)!;

  if (DRY_RUN) {
    authorCache.set(cleanName, `dry-run-author-${cleanName}`);
    return authorCache.get(cleanName)!;
  }

  try {
    // Search existing authors
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "author" && name == $name][0]{ _id }`,
      { name: cleanName }
    );
    if (existing) {
      authorCache.set(cleanName, existing._id);
      return existing._id;
    }

    // Create new author
    const created = await client.create({ _type: 'author', name: cleanName });
    authorCache.set(cleanName, created._id);
    console.log(`  ✓ Created author: ${cleanName} → ${created._id}`);
    return created._id;
  } catch (err) {
    console.error(`  ✗ Failed to get/create author "${cleanName}":`, err);
    return null;
  }
}

// ─── Source management ────────────────────────────────────────────────────────

async function createSourceDocs(
  sources: Array<{ label: string; url: string }>
): Promise<string[]> {
  const ids: string[] = [];
  for (const src of sources) {
    if (DRY_RUN) {
      ids.push(`dry-run-source-${src.label}`);
      continue;
    }
    try {
      const doc = await client.create({
        _type: 'source',
        label: src.label,
        url: src.url,
        type: 'article',
      });
      ids.push(doc._id);
    } catch (err) {
      console.error(`  ✗ Failed to create source "${src.label}":`, err);
    }
  }
  return ids;
}

// ─── Main migration ───────────────────────────────────────────────────────────

async function migrateArticle(config: ArticleConfig): Promise<void> {
  const htmlPath = path.join(ARTICLES_DIR, config.htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.warn(`File not found: ${htmlPath}`);
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');

  // ── Metadata ──
  // Use override if provided (handles og:title with unescaped internal quotes)
  const rawTitle =
    config.titleOverride ||
    extractMeta(html, 'og:title') ||
    extractMeta(html, 'twitter:title') ||
    decodeHtmlEntities(html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '') ||
    config.htmlFile;
  const title = rawTitle.trim().replace(/\.$/, '').trim();
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description');
  const rawKeywords = extractMeta(html, 'keywords');
  const keywords = rawKeywords
    ? rawKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const { author, dateRaw } = extractByline(html);
  const publishedAt = parseDate(dateRaw);
  const slug = slugify(title);

  console.log(`\n─── ${title}`);
  console.log(`    Author: ${author} | Date: ${dateRaw} → ${publishedAt}`);

  // ── Check for existing article ──
  if (!DRY_RUN) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "article" && slug.current == $slug][0]{ _id }`,
      { slug }
    );
    if (existing) {
      console.log(`  ⊘ Already exists (slug: ${slug}), skipping.`);
      return;
    }
  }

  // ── Body blocks ──
  let bodyBlocks = extractBodyBlocks(html);
  if (config.sectionInsertions) {
    bodyBlocks = injectSectionHeadings(bodyBlocks, config.sectionInsertions);
  }

  // ── Images ──
  const imageFilenames = bodyBlocks
    .filter((b): b is { kind: 'image'; filename: string } => b.kind === 'image')
    .map((b) => b.filename);

  console.log(`  Images: ${imageFilenames.length} | Blocks: ${bodyBlocks.length}`);
  const imageRefs = await uploadImages(imageFilenames);

  // ── Main image: first content image ──
  let mainImageRef: string | null = null;
  for (const fn of imageFilenames) {
    const ref = imageRefs.get(fn.toLowerCase());
    if (ref) {
      mainImageRef = ref;
      break;
    }
  }

  // ── Author ──
  const authorId = await getOrCreateAuthor(author);

  // ── Sources ──
  const sources = extractSourceUrls(html);
  console.log(`  Sources: ${sources.length}`);
  const sourceIds = await createSourceDocs(sources);

  // ── Portable text body ──
  const portableBody = buildPortableText(bodyBlocks, imageRefs);

  // ── Lead paragraph (first significant text block) ──
  const firstText = bodyBlocks.find(
    (b) => b.kind === 'text' && (b as { kind: 'text'; text: string }).text.length > 80
  );
  const leadParagraph =
    firstText && firstText.kind === 'text'
      ? (firstText as { kind: 'text'; text: string }).text.substring(0, 400)
      : description.substring(0, 400);

  // ── Tags (from config + extracted hashtags, deduped) ──
  const hashtagTags = extractHashtags(html)
    .filter((t) => !t.includes('op') && t.length > 3)
    .slice(0, 5);
  const tags = [...new Set([...config.tags, ...hashtagTags])].slice(0, 10);

  // ── Article document ──
  const articleDoc: Record<string, unknown> & { _type: string } = {
    _type: 'article',
    title,
    slug: { _type: 'slug', current: slug },
    description,
    keywords,
    publishedAt,
    location: config.location,
    leadParagraph,
    tags,
    body: portableBody,
    methodology:
      'This article was originally published on the Anon Resistance News website (news.anonresistance.dx.am) and has been migrated to UnTelevised Media.',
    allowComments: true,
    featured: false,
    breakingNews: false,
    needsReview: false,
    faqs: config.faqs.map((faq) => ({
      _type: 'faqItem',
      _key: makeKey(),
      question: faq.question,
      answer: faq.answer,
    })),
  };

  if (mainImageRef && !DRY_RUN) {
    articleDoc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: mainImageRef } };
  }
  if (authorId) {
    articleDoc.author = { _type: 'reference', _ref: authorId };
  }
  if (sourceIds.length > 0) {
    articleDoc.sources = sourceIds.map((id) => ({ _type: 'reference', _ref: id }));
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would create article: ${slug}`);
    console.log(`  Portable text blocks: ${portableBody.length}`);
    return;
  }

  try {
    const created = await client.create(articleDoc);
    console.log(`  ✓ Created article: ${created._id} (${slug})`);
  } catch (err) {
    console.error(`  ✗ Failed to create article "${title}":`, err);
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  AR News Articles Migration ${DRY_RUN ? '[DRY RUN]' : '[LIVE]'}`);
  console.log(`${'═'.repeat(60)}`);

  const configs = FILE_ARG
    ? ARTICLE_CONFIGS.filter((c) => c.htmlFile === FILE_ARG)
    : ARTICLE_CONFIGS;

  if (configs.length === 0) {
    console.error(`No matching config for file: ${FILE_ARG}`);
    process.exit(1);
  }

  console.log(`Migrating ${configs.length} article(s)...\n`);

  let success = 0;
  for (const config of configs) {
    try {
      await migrateArticle(config);
      success++;
    } catch (err) {
      console.error(`Failed: ${config.htmlFile}`, err);
    }
    // Small delay between articles to avoid rate limiting
    if (!DRY_RUN) await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Done. ${success}/${configs.length} articles processed.`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
