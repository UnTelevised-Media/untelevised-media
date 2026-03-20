// scripts/seed-fact-checks.mjs
// Run with: node scripts/seed-fact-checks.mjs
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ypejdt32',
  dataset: 'articles',
  apiVersion: '2025-06-04',
  token: 'skhhJyYQtW9pwQmkAYWIoOcvk5LHynaefsPu6ygqa3AaClORQsWBUEQKTChM9ZsjSnzbNaJnfXHkMPhwwsmko3PlGH0An3Rbq5lQ8i8EvwcGSKpStTpZzExXLkLazrwp0j5n5Kj3QyjHCLlEBe75jqJu8B1DMWrnZ1prUL1fFhLL1QmwBink',
  useCdn: false,
});

const factChecks = [
  {
    _type: 'factCheck',
    title: 'Did the U.S. National Debt Double Under Biden?',
    slug: { _type: 'slug', current: 'did-us-national-debt-double-under-biden' },
    publishedAt: '2025-03-10T12:00:00.000Z',
    claim:
      'The national debt doubled under Joe Biden, adding more debt than any president in history.',
    claimSource: 'Social media posts circulating March 2025',
    claimDate: '2025-03-01T00:00:00.000Z',
    rating: 'misleading',
    ratingExplanation:
      'The national debt did increase substantially during Biden\'s term — by roughly $8 trillion — but it did not double, and raw dollar comparisons ignore inflation and the inherited COVID-era spending obligations that drove much of that increase.',
    sources: [
      {
        _key: 'src1',
        label: 'U.S. Treasury — Debt to the Penny',
        url: 'https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny',
      },
      {
        _key: 'src2',
        label: 'Committee for a Responsible Federal Budget — Deficit Tracker',
        url: 'https://www.crfb.org/debtfixer',
      },
    ],
  },
  {
    _type: 'factCheck',
    title: 'Did U.S. Inflation Peak at 9.1% in June 2022?',
    slug: { _type: 'slug', current: 'did-us-inflation-peak-9-1-percent-june-2022' },
    publishedAt: '2025-02-18T09:00:00.000Z',
    claim: 'U.S. inflation hit 9.1% in June 2022 — the highest in 40 years.',
    claimSource: 'Widely cited in political debate, early 2025',
    claimDate: '2025-02-01T00:00:00.000Z',
    rating: 'true',
    ratingExplanation:
      'The Bureau of Labor Statistics confirmed that the Consumer Price Index rose 9.1% year-over-year in June 2022, the highest 12-month increase since the period ending November 1981. This is accurate.',
    sources: [
      {
        _key: 'src1',
        label: 'Bureau of Labor Statistics — CPI June 2022 Release',
        url: 'https://www.bls.gov/news.release/archives/cpi_07132022.htm',
      },
    ],
  },
  {
    _type: 'factCheck',
    title: 'Do Electric Vehicles Produce More Carbon Than Gas Cars?',
    slug: { _type: 'slug', current: 'do-electric-vehicles-produce-more-carbon-than-gas-cars' },
    publishedAt: '2025-03-01T10:00:00.000Z',
    claim:
      'Electric vehicles produce more carbon emissions than gasoline-powered cars when you account for manufacturing.',
    claimSource: 'Viral Facebook posts and conservative media, February 2025',
    claimDate: '2025-02-15T00:00:00.000Z',
    rating: 'mostly-false',
    ratingExplanation:
      'Manufacturing an EV does produce more emissions than a comparable gas car — primarily from battery production — but over a vehicle\'s lifetime, EVs emit significantly less CO₂ in nearly every region of the world, including those with coal-heavy grids. The claim cherry-picks manufacturing data and ignores total lifecycle emissions.',
    sources: [
      {
        _key: 'src1',
        label: 'International Council on Clean Transportation — EV Life Cycle Analysis',
        url: 'https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/',
      },
      {
        _key: 'src2',
        label: 'MIT Climate Portal — Are Electric Vehicles Definitely Better for the Climate?',
        url: 'https://climate.mit.edu/ask-mit/are-electric-vehicles-definitely-better-climate',
      },
    ],
  },
  {
    _type: 'factCheck',
    title: 'Will AI Eliminate 40% of Jobs by 2030?',
    slug: { _type: 'slug', current: 'will-ai-eliminate-40-percent-jobs-by-2030' },
    publishedAt: '2025-03-15T14:00:00.000Z',
    claim: 'Artificial intelligence will eliminate 40% of all jobs by 2030.',
    claimSource: 'Widely shared in tech and policy circles, citing various AI reports',
    claimDate: '2025-03-10T00:00:00.000Z',
    rating: 'unverifiable',
    ratingExplanation:
      'Numerous credible institutions have published wildly different projections — from 14% (OECD) to 47% (Oxford) of jobs "at risk." These are exposure estimates, not predictions of elimination, and the 2030 timeline is speculative. The claim as stated cannot be verified because no authoritative consensus figure of 40% exists.',
    sources: [
      {
        _key: 'src1',
        label: 'Goldman Sachs — The Potentially Large Effects of AI on Economic Growth (2023)',
        url: 'https://www.gspublishing.com/content/research/en/reports/2023/03/27/d64e052b-0f6e-45d5-a0ae-d09a4197d671.html',
      },
      {
        _key: 'src2',
        label: 'OECD — The Risk of Automation for Jobs in OECD Countries',
        url: 'https://www.oecd-ilibrary.org/social-issues-migration-health/the-risk-of-automation-for-jobs-in-oecd-countries_5jlz9h56dvq7-en',
      },
    ],
  },
  {
    _type: 'factCheck',
    title: "Is the U.S. Southern Border 'Wide Open' with No Enforcement?",
    slug: { _type: 'slug', current: 'is-us-southern-border-wide-open-no-enforcement' },
    publishedAt: '2025-03-18T08:00:00.000Z',
    claim: 'The U.S. southern border is wide open — there is no enforcement and anyone can walk in.',
    claimSource: 'Repeated by multiple politicians and commentators, 2024–2025',
    claimDate: '2025-01-01T00:00:00.000Z',
    rating: 'false',
    ratingExplanation:
      'Customs and Border Protection recorded over 2 million enforcement encounters in fiscal year 2023 — the highest on record — demonstrating active enforcement at scale. While illegal crossings reached record highs, describing the border as having "no enforcement" contradicts documented CBP operations, deportations, and Title 42/Title 8 expulsions.',
    sources: [
      {
        _key: 'src1',
        label:
          'U.S. Customs and Border Protection — Southwest Land Border Encounters FY2023',
        url: 'https://www.cbp.gov/newsroom/stats/southwest-land-border-encounters',
      },
      {
        _key: 'src2',
        label: 'DHS — Immigration Enforcement Actions 2023',
        url: 'https://www.dhs.gov/immigration-statistics/enforcement-actions',
      },
    ],
  },
];

async function seed() {
  console.log('Seeding 5 fact-check documents to Sanity...\n');

  for (const fc of factChecks) {
    try {
      // Use createOrReplace to avoid duplicates on re-runs
      const doc = await client.createOrReplace({
        ...fc,
        _id: `factcheck-seed-${fc.slug.current}`,
      });
      console.log(`✅ Created: ${doc._id} — ${fc.title}`);
    } catch (err) {
      console.error(`❌ Failed to create "${fc.title}":`, err.message);
    }
  }

  console.log('\nDone.');
}

seed();
