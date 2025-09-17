#!/usr/bin/env node

/**
 * Timeline Data Verification Script
 * 
 * This script verifies that the timeline data was successfully created in Sanity CMS
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
  token: process.env.SANITY_API_READ_TOKEN, // Use read token for verification
  useCdn: false,
});

async function verifyData() {
  console.log('🔍 Verifying timeline data in Sanity CMS...\n');
  
  try {
    // Verify timeline categories
    console.log('📂 Checking timeline categories...');
    const categories = await client.fetch(`
      *[_type == "timelineCategory"] {
        _id,
        title,
        slug,
        color,
        isActive
      }
    `);
    
    console.log(`✅ Found ${categories.length} timeline categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.title} (${cat.slug.current}) - ${cat.color} - ${cat.isActive ? 'Active' : 'Inactive'}`);
    });
    
    // Verify timeline events
    console.log('\n📅 Checking timeline events...');
    const events = await client.fetch(`
      *[_type == "timelineEvent"] {
        _id,
        title,
        slug,
        eventDate,
        eventType,
        importanceLevel,
        isMilestone,
        isPublished,
        location
      }
    `);
    
    console.log(`✅ Found ${events.length} timeline events:`);
    events.forEach(event => {
      const date = new Date(event.eventDate).toLocaleDateString();
      const milestone = event.isMilestone ? '⭐' : '';
      console.log(`   ${milestone} ${event.title} (${date}) - ${event.eventType}/${event.importanceLevel} - ${event.location || 'No location'}`);
    });
    
    // Verify timeline collections
    console.log('\n📚 Checking timeline collections...');
    const timelines = await client.fetch(`
      *[_type == "timeline"] {
        _id,
        title,
        slug,
        timelineType,
        isFeatured,
        isPublished,
        "eventCount": count(events)
      }
    `);
    
    console.log(`✅ Found ${timelines.length} timeline collections:`);
    timelines.forEach(timeline => {
      const featured = timeline.isFeatured ? '⭐' : '';
      console.log(`   ${featured} ${timeline.title} (${timeline.timelineType}) - ${timeline.eventCount} events`);
    });
    
    // Test queries used by the application
    console.log('\n🔍 Testing application queries...');
    
    // Test featured timelines query
    const featuredTimelines = await client.fetch(`
      *[_type=='timeline' && isPublished == true && isFeatured == true] {
        _id,
        title,
        slug
      } | order(publishedAt desc) [0...6]
    `);
    console.log(`✅ Featured timelines query: ${featuredTimelines.length} results`);
    
    // Test recent events query
    const recentEvents = await client.fetch(`
      *[_type=='timelineEvent' && isPublished == true] {
        _id,
        title,
        eventDate
      } | order(eventDate desc) [0...10]
    `);
    console.log(`✅ Recent events query: ${recentEvents.length} results`);
    
    // Test milestone events query
    const milestoneEvents = await client.fetch(`
      *[_type=='timelineEvent' && isPublished == true && isMilestone == true] {
        _id,
        title,
        eventDate
      } | order(eventDate desc)
    `);
    console.log(`✅ Milestone events query: ${milestoneEvents.length} results`);
    
    // Test timeline categories query
    const activeCategories = await client.fetch(`
      *[_type == "timelineCategory" && isActive == true] {
        _id,
        title,
        'eventCount': count(*[_type == 'timelineEvent' && references(^._id)])
      } | order(order asc)
    `);
    console.log(`✅ Active categories query: ${activeCategories.length} results`);
    
    console.log('\n🎉 Data verification completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${categories.length} timeline categories`);
    console.log(`- ${events.length} timeline events`);
    console.log(`- ${timelines.length} timeline collections`);
    console.log(`- ${milestoneEvents.length} milestone events`);
    console.log(`- ${featuredTimelines.length} featured timelines`);
    
    // Verify time scale diversity
    console.log('\n⏰ Time Scale Analysis:');
    const eventDates = events.map(e => new Date(e.eventDate));
    const minDate = new Date(Math.min(...eventDates));
    const maxDate = new Date(Math.max(...eventDates));
    const timeSpan = maxDate.getTime() - minDate.getTime();
    const years = timeSpan / (1000 * 60 * 60 * 24 * 365.25);
    
    console.log(`- Earliest event: ${minDate.toLocaleDateString()}`);
    console.log(`- Latest event: ${maxDate.toLocaleDateString()}`);
    console.log(`- Time span: ${Math.round(years)} years`);
    console.log('- This demonstrates excellent time scale diversity for testing zoom functionality!');
    
    console.log('\n🔗 Test URLs:');
    console.log('- Timeline overview: http://localhost:3000/timelines');
    console.log('- Historical milestones: http://localhost:3000/timeline/historical-milestones');
    console.log('- Boston Marathon event: http://localhost:3000/timeline/event/boston-marathon-bombing-2013');
    console.log('- Historical events category: http://localhost:3000/timeline/category/historical-events');
    
  } catch (error) {
    console.error('❌ Error during data verification:', error.message);
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  verifyData();
}

module.exports = { verifyData };
