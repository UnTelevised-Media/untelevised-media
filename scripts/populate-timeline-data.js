#!/usr/bin/env node

/**
 * Timeline Data Population Script
 *
 * This script populates the Sanity CMS with sample timeline events and categories
 * to demonstrate the timeline functionality across different time scales.
 */

const { createClient } = require('@sanity/client');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-04',
  token: process.env.SANITY_API_WRITE_TOKEN, // Need write token for mutations
  useCdn: false, // Don't use CDN for mutations
});

// Sample timeline categories
const timelineCategories = [
  {
    _type: 'timelineCategory',
    _id: 'historical-events',
    title: 'Historical Events',
    slug: { current: 'historical-events' },
    description: 'Major historical events and milestones throughout history',
    color: 'purple',
    icon: 'calendar',
    order: 1,
    isActive: true,
  },
  {
    _type: 'timelineCategory',
    _id: 'political-events',
    title: 'Political Events',
    slug: { current: 'political-events' },
    description: 'Political developments, government changes, and policy decisions',
    color: 'blue',
    icon: 'government',
    order: 2,
    isActive: true,
  },
  {
    _type: 'timelineCategory',
    _id: 'breaking-news',
    title: 'Breaking News',
    slug: { current: 'breaking-news' },
    description: 'Recent breaking news events and developing stories',
    color: 'red',
    icon: 'alert',
    order: 3,
    isActive: true,
  },
];

// Sample timeline events
const timelineEvents = [
  {
    _type: 'timelineEvent',
    _id: 'fall-of-roman-empire-476',
    title: 'Fall of the Western Roman Empire',
    slug: { current: 'fall-of-roman-empire-476' },
    description:
      'The deposition of Romulus Augustulus marked the end of the Western Roman Empire, a pivotal moment that historians consider the end of ancient history and the beginning of the medieval period.',
    detailedDescription: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'On September 4, 476 AD, Odoacer, a Germanic chieftain, deposed Romulus Augustulus, the last Western Roman Emperor. This event is traditionally considered the end of the Western Roman Empire and marks a significant transition in European history.',
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The fall was not sudden but the result of centuries of decline, including economic troubles, military pressures from barbarian tribes, political instability, and the division of the empire. The Eastern Roman Empire (Byzantine Empire) continued for nearly another thousand years until 1453.',
          },
        ],
      },
    ],
    eventDate: '0476-09-04',
    eventType: 'political',
    importanceLevel: 'critical',
    isMilestone: true,
    location: 'Ravenna, Italy',
    timelineCategories: [
      { _type: 'reference', _ref: 'historical-events' },
      { _type: 'reference', _ref: 'political-events' },
    ],
    tags: ['Roman Empire', 'Ancient History', 'Medieval Period', 'Odoacer', 'Romulus Augustulus'],
    isPublished: true,
    publishedAt: new Date().toISOString(),
    externalLinks: [
      {
        title: 'Britannica: Fall of Rome',
        url: 'https://www.britannica.com/event/fall-of-Rome',
        description: 'Comprehensive overview of the fall of the Roman Empire',
      },
    ],
  },
  {
    _type: 'timelineEvent',
    _id: 'declaration-independence-1776',
    title: 'Declaration of Independence Signed',
    slug: { current: 'declaration-independence-1776' },
    description:
      "The Continental Congress approved the Declaration of Independence, formally announcing the thirteen American colonies' independence from British rule and establishing the United States of America.",
    detailedDescription: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: "On July 4, 1776, the Continental Congress approved the final wording of the Declaration of Independence, drafted primarily by Thomas Jefferson. This document proclaimed the colonies' independence from British rule and outlined the philosophical foundations of the new nation.",
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Declaration articulated revolutionary principles including natural rights, popular sovereignty, and the right of revolution. It stated that "all men are created equal" and are endowed with "unalienable Rights" including "Life, Liberty and the pursuit of Happiness."',
          },
        ],
      },
    ],
    eventDate: '1776-07-04',
    eventType: 'political',
    importanceLevel: 'critical',
    isMilestone: true,
    location: 'Philadelphia, Pennsylvania',
    timelineCategories: [
      { _type: 'reference', _ref: 'historical-events' },
      { _type: 'reference', _ref: 'political-events' },
    ],
    tags: [
      'American Revolution',
      'Independence',
      'Thomas Jefferson',
      'Continental Congress',
      'Founding Fathers',
    ],
    isPublished: true,
    publishedAt: new Date().toISOString(),
    externalLinks: [
      {
        title: 'National Archives: Declaration of Independence',
        url: 'https://www.archives.gov/founding-docs/declaration-transcript',
        description: 'Official transcript of the Declaration of Independence',
      },
    ],
  },
  {
    _type: 'timelineEvent',
    _id: 'boston-marathon-bombing-2013',
    title: 'Boston Marathon Bombing',
    slug: { current: 'boston-marathon-bombing-2013' },
    description:
      'Two pressure cooker bombs exploded near the finish line of the Boston Marathon, killing 3 people and injuring hundreds. A massive manhunt followed, culminating in the capture of the perpetrators.',
    detailedDescription: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'On April 15, 2013, at approximately 2:49 PM EDT, two homemade pressure cooker bombs exploded near the finish line of the Boston Marathon. The attack killed 3 people and injured an estimated 264 others, many losing limbs.',
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The FBI launched an extensive investigation, releasing photos and videos of the suspects on April 18. A massive manhunt ensued, during which one suspect was killed and the other was captured on April 19, 2013, after a citywide lockdown of Boston and surrounding areas.',
          },
        ],
      },
    ],
    eventDate: '2013-04-15T18:49:00.000Z',
    endDate: '2013-04-19T23:00:00.000Z',
    eventType: 'breaking',
    importanceLevel: 'critical',
    isMilestone: false,
    location: 'Boston, Massachusetts',
    timelineCategories: [{ _type: 'reference', _ref: 'breaking-news' }],
    tags: ['Terrorism', 'Boston Marathon', 'FBI Investigation', 'Manhunt', 'Public Safety'],
    isPublished: true,
    publishedAt: new Date().toISOString(),
    externalLinks: [
      {
        title: 'FBI: Boston Marathon Bombing',
        url: 'https://www.fbi.gov/history/famous-cases/boston-marathon-bombing',
        description: "FBI's official account of the investigation",
      },
    ],
  },
];

// Sample timeline collection
const timelineCollection = {
  _type: 'timeline',
  _id: 'historical-milestones',
  title: 'Historical Milestones Through Time',
  slug: { current: 'historical-milestones' },
  shortDescription:
    'A comprehensive timeline showcasing major historical events across different time periods, from ancient civilizations to modern times.',
  description: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'This timeline demonstrates the interactive timeline functionality by showcasing events across vastly different time scales - from ancient history spanning millennia to recent events measured in days.',
        },
      ],
    },
  ],
  timelineType: 'historical',
  timeRange: {
    startDate: '0476-09-04',
    endDate: '2013-04-19',
  },
  events: [
    { _type: 'reference', _ref: 'fall-of-roman-empire-476' },
    { _type: 'reference', _ref: 'declaration-independence-1776' },
    { _type: 'reference', _ref: 'boston-marathon-bombing-2013' },
  ],
  categories: [
    { _type: 'reference', _ref: 'historical-events' },
    { _type: 'reference', _ref: 'political-events' },
    { _type: 'reference', _ref: 'breaking-news' },
  ],
  isFeatured: true,
  isPublished: true,
  publishedAt: new Date().toISOString(),
  viewSettings: {
    defaultZoomLevel: 'year',
    showMilestonesOnly: false,
  },
  seoSettings: {
    metaTitle: 'Historical Milestones Timeline - Interactive History',
    metaDescription:
      'Explore major historical events through an interactive timeline spanning from ancient Rome to modern times.',
    keywords: 'history, timeline, historical events, interactive timeline, milestones',
  },
};

async function populateData() {
  console.log('🚀 Starting timeline data population...');

  try {
    // Check if we have the required environment variables
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      throw new Error(
        'Missing SANITY_API_WRITE_TOKEN environment variable. Please add a write token to your .env file.'
      );
    }

    console.log('📝 Creating timeline categories...');

    // Create categories first
    for (const category of timelineCategories) {
      try {
        const result = await client.createOrReplace(category);
        console.log(`✅ Created category: ${category.title} (${result._id})`);
      } catch (error) {
        console.error(`❌ Failed to create category ${category.title}:`, error.message);
      }
    }

    console.log('📅 Creating timeline events...');

    // Create timeline events
    for (const event of timelineEvents) {
      try {
        const result = await client.createOrReplace(event);
        console.log(`✅ Created event: ${event.title} (${result._id})`);
      } catch (error) {
        console.error(`❌ Failed to create event ${event.title}:`, error.message);
      }
    }

    console.log('📚 Creating timeline collection...');

    // Create timeline collection
    try {
      const result = await client.createOrReplace(timelineCollection);
      console.log(`✅ Created timeline: ${timelineCollection.title} (${result._id})`);
    } catch (error) {
      console.error(`❌ Failed to create timeline collection:`, error.message);
    }

    console.log('🎉 Timeline data population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${timelineCategories.length} timeline categories created`);
    console.log(`- ${timelineEvents.length} timeline events created`);
    console.log(`- 1 timeline collection created`);
    console.log('\n🔗 You can now view the timeline at: /timelines');
  } catch (error) {
    console.error('💥 Error during data population:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateData();
}

module.exports = { populateData, timelineCategories, timelineEvents, timelineCollection };
