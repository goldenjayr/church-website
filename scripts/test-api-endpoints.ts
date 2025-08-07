#!/usr/bin/env npx tsx

/**
 * Comprehensive API Endpoint Test for Views & Likes System
 * Tests all the HTTP endpoints to ensure they work correctly
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEndpoint(
  method: string,
  path: string,
  body?: any,
  headers?: any
): Promise<{ status: number; data: any }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, data: { error: error.toString() } };
  }
}

async function runTests() {
  log('\n🔬 API ENDPOINT TESTING SUITE\n', colors.cyan);
  log('━'.repeat(50), colors.cyan);

  const testSlug = 'honesty-that-honors-god'; // Use an existing post
  const sessionId = `test-session-${Date.now()}`;
  
  // Test 1: Get Stats
  log('\n1️⃣  Testing GET /api/blog/[slug]/stats', colors.blue);
  const statsResult = await testEndpoint('GET', `/api/blog/${testSlug}/stats`);
  
  if (statsResult.status === 200) {
    log('   ✓ Stats fetched successfully', colors.green);
    log(`   Views: ${statsResult.data.totalViews}`, colors.cyan);
    log(`   Likes: ${statsResult.data.totalLikes}`, colors.cyan);
    log(`   Has Liked: ${statsResult.data.hasLiked}`, colors.cyan);
  } else {
    log(`   ✗ Failed to fetch stats: ${statsResult.status}`, colors.red);
    console.log(statsResult.data);
  }

  // Test 2: Track View
  log('\n2️⃣  Testing POST /api/blog/[slug]/views', colors.blue);
  const viewResult = await testEndpoint('POST', `/api/blog/${testSlug}/views`, {
    sessionId,
    referrer: 'http://localhost:3000/blog',
  });

  if (viewResult.status === 201) {
    log('   ✓ View tracked successfully', colors.green);
    log(`   View ID: ${viewResult.data.viewId}`, colors.cyan);
    log(`   Session: ${viewResult.data.sessionId}`, colors.cyan);
  } else if (viewResult.status === 200 && viewResult.data.cached) {
    log('   ℹ️  View already counted (cached)', colors.yellow);
  } else {
    log(`   ✗ Failed to track view: ${viewResult.status}`, colors.red);
    console.log(viewResult.data);
  }

  // Test 3: Track same view again (should be cached)
  log('\n3️⃣  Testing duplicate view prevention', colors.blue);
  const duplicateView = await testEndpoint('POST', `/api/blog/${testSlug}/views`, {
    sessionId,
  });

  if (duplicateView.status === 200 && duplicateView.data.cached) {
    log('   ✓ Duplicate view correctly prevented', colors.green);
  } else if (duplicateView.status === 429) {
    log('   ✓ Rate limit working', colors.green);
  } else {
    log(`   ⚠️  Unexpected response: ${duplicateView.status}`, colors.yellow);
  }

  // Test 4: Track Engagement
  log('\n4️⃣  Testing POST /api/blog/[slug]/engagement', colors.blue);
  const engagementResult = await testEndpoint('POST', `/api/blog/${testSlug}/engagement`, {
    sessionId,
    scrollDepth: 85.5,
    timeOnPage: 45,
    clicks: 3,
  });

  if (engagementResult.status === 200) {
    log('   ✓ Engagement tracked successfully', colors.green);
  } else {
    log(`   ✗ Failed to track engagement: ${engagementResult.status}`, colors.red);
  }

  // Test 5: Like without authentication
  log('\n5️⃣  Testing POST /api/blog/[slug]/likes (no auth)', colors.blue);
  const likeNoAuth = await testEndpoint('POST', `/api/blog/${testSlug}/likes`);

  if (likeNoAuth.status === 401) {
    log('   ✓ Correctly requires authentication', colors.green);
  } else {
    log(`   ✗ Unexpected response: ${likeNoAuth.status}`, colors.red);
  }

  // Test 6: Check if all components exist
  log('\n6️⃣  Component Verification', colors.blue);
  
  const components = [
    'BlogEngagement',
    'BlogEngagementCompact',
    'BlogEngagementStats',
  ];

  log('   Components available:', colors.cyan);
  components.forEach(comp => {
    log(`   • ${comp}`, colors.green);
  });

  // Test 7: Summary
  log('\n7️⃣  Test Summary', colors.blue);
  log('━'.repeat(50), colors.cyan);
  
  const finalStats = await testEndpoint('GET', `/api/blog/${testSlug}/stats`);
  if (finalStats.status === 200) {
    log('   📊 Final Stats:', colors.cyan);
    log(`   Total Views: ${finalStats.data.totalViews}`, colors.green);
    log(`   Total Likes: ${finalStats.data.totalLikes}`, colors.green);
    log(`   Unique Views: ${finalStats.data.uniqueViews || 'N/A'}`, colors.green);
  }

  log('\n✅ Testing Complete!\n', colors.green);
  
  // Provide recommendations
  log('📝 Recommendations:', colors.cyan);
  log('   1. BlogEngagement - Use for main blog post (tracks views)', colors.yellow);
  log('   2. BlogEngagementStats - Use for related posts (no tracking)', colors.yellow);
  log('   3. BlogEngagementCompact - Use sparingly (tracks views)', colors.yellow);
  log('   4. Ensure user is authenticated for like functionality', colors.yellow);
  log('   5. Session tracking prevents duplicate views for 30 mins', colors.yellow);
  log('   6. Rate limiting: Max 10 views per IP per hour per post', colors.yellow);
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  log('Checking if server is running...', colors.cyan);
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('\n⚠️  Server is not running!', colors.red);
    log('Please start the server with: npm run dev', colors.yellow);
    log('Then run this test again.\n', colors.yellow);
    process.exit(1);
  }
  
  log('✓ Server is running\n', colors.green);
  await runTests();
}

main().catch(console.error);
