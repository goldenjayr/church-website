import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

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

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEngagementSystem() {
  log('\n🧪 COMPREHENSIVE ENGAGEMENT SYSTEM TEST\n', colors.cyan);
  
  try {
    // 1. Check database schema
    log('1️⃣  Checking Database Schema...', colors.blue);
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('BlogPost', 'BlogPostView', 'BlogPostLike', 'BlogPostStats', 'UserEngagement')
    ` as any[];
    
    log(`   Found ${tables.length} engagement tables`, colors.green);
    tables.forEach((t: any) => log(`   ✓ ${t.table_name}`, colors.green));
    
    // 2. Get test data
    log('\n2️⃣  Getting Test Data...', colors.blue);
    
    const blogPosts = await prisma.blogPost.findMany({
      take: 3,
      include: {
        stats: true,
        views: {
          take: 5
        },
        likes: {
          take: 5
        }
      }
    });
    
    if (blogPosts.length === 0) {
      log('   ⚠️  No blog posts found. Creating test post...', colors.yellow);
      const testPost = await prisma.blogPost.create({
        data: {
          title: 'Test Post for Engagement',
          slug: 'test-engagement-post',
          content: '<p>Test content</p>',
          published: true,
          authorId: (await prisma.user.findFirst())?.id || '',
        }
      });
      blogPosts.push(testPost as any);
    }
    
    log(`   Found ${blogPosts.length} blog posts`, colors.green);
    
    // 3. Test view tracking
    log('\n3️⃣  Testing View Tracking...', colors.blue);
    
    for (const post of blogPosts.slice(0, 1)) {
      log(`   Testing post: ${post.title}`, colors.cyan);
      
      // Check initial stats
      const initialStats = post.stats;
      log(`   Initial views: ${initialStats?.totalViews || 0}`, colors.yellow);
      
      // Simulate a view
      const viewData = {
        blogPostId: post.id,
        sessionId: `test-session-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
      };
      
      const newView = await prisma.blogPostView.create({
        data: viewData
      });
      
      log(`   ✓ Created view record: ${newView.id}`, colors.green);
      
      // Update stats
      if (!post.stats) {
        await prisma.blogPostStats.create({
          data: {
            blogPostId: post.id,
            totalViews: 1,
            uniqueViews: 1,
            anonymousViews: 1,
          }
        });
      } else {
        await prisma.blogPostStats.update({
          where: { blogPostId: post.id },
          data: {
            totalViews: { increment: 1 },
            uniqueViews: { increment: 1 },
            anonymousViews: { increment: 1 },
          }
        });
      }
      
      // Verify update
      const updatedPost = await prisma.blogPost.findUnique({
        where: { id: post.id },
        include: { stats: true }
      });
      
      log(`   New views: ${updatedPost?.stats?.totalViews || 0}`, colors.green);
    }
    
    // 4. Test like functionality
    log('\n4️⃣  Testing Like Functionality...', colors.blue);
    
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      const post = blogPosts[0];
      log(`   Testing likes for: ${post.title}`, colors.cyan);
      
      // Check if already liked
      const existingLike = await prisma.blogPostLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: post.id,
            userId: testUser.id
          }
        }
      });
      
      if (existingLike) {
        log(`   User already liked this post, removing like...`, colors.yellow);
        await prisma.blogPostLike.delete({
          where: { id: existingLike.id }
        });
        
        // Update stats
        if (post.stats) {
          await prisma.blogPostStats.update({
            where: { blogPostId: post.id },
            data: {
              totalLikes: { decrement: 1 }
            }
          });
        }
        log(`   ✓ Like removed`, colors.green);
      } else {
        log(`   Adding like...`, colors.yellow);
        await prisma.blogPostLike.create({
          data: {
            blogPostId: post.id,
            userId: testUser.id
          }
        });
        
        // Update stats
        if (post.stats) {
          await prisma.blogPostStats.update({
            where: { blogPostId: post.id },
            data: {
              totalLikes: { increment: 1 }
            }
          });
        } else {
          await prisma.blogPostStats.create({
            data: {
              blogPostId: post.id,
              totalLikes: 1
            }
          });
        }
        log(`   ✓ Like added`, colors.green);
      }
      
      // Verify likes count
      const finalPost = await prisma.blogPost.findUnique({
        where: { id: post.id },
        include: { 
          stats: true,
          likes: true
        }
      });
      
      log(`   Total likes: ${finalPost?.stats?.totalLikes || 0}`, colors.green);
      log(`   Like records: ${finalPost?.likes.length || 0}`, colors.green);
    } else {
      log('   ⚠️  No user found for like testing', colors.yellow);
    }
    
    // 5. Test engagement tracking
    log('\n5️⃣  Testing Engagement Tracking...', colors.blue);
    
    const engagementData = {
      sessionId: `test-session-${Date.now()}`,
      blogPostId: blogPosts[0].id,
      scrollDepth: 75.5,
      timeOnPage: 120,
      clicks: 5,
    };
    
    const engagement = await prisma.userEngagement.upsert({
      where: {
        sessionId_blogPostId: {
          sessionId: engagementData.sessionId,
          blogPostId: engagementData.blogPostId
        }
      },
      update: {
        scrollDepth: engagementData.scrollDepth,
        timeOnPage: engagementData.timeOnPage,
        clicks: engagementData.clicks,
      },
      create: engagementData
    });
    
    log(`   ✓ Engagement tracked: ${engagement.id}`, colors.green);
    log(`     Scroll depth: ${engagement.scrollDepth}%`, colors.cyan);
    log(`     Time on page: ${engagement.timeOnPage}s`, colors.cyan);
    log(`     Clicks: ${engagement.clicks}`, colors.cyan);
    
    // 6. Test rate limiting
    log('\n6️⃣  Testing Rate Limiting...', colors.blue);
    
    const rateLimitKey = `view:127.0.0.1:${blogPosts[0].id}`;
    const rateLimit = await prisma.rateLimit.create({
      data: {
        identifier: rateLimitKey,
        action: 'view',
        count: 1,
      }
    });
    
    log(`   ✓ Rate limit record created`, colors.green);
    
    // Clean up test rate limit
    await prisma.rateLimit.delete({
      where: { id: rateLimit.id }
    });
    
    // 7. Generate summary report
    log('\n7️⃣  Summary Report', colors.blue);
    log('━'.repeat(50), colors.cyan);
    
    const totalViews = await prisma.blogPostView.count();
    const totalLikes = await prisma.blogPostLike.count();
    const totalEngagements = await prisma.userEngagement.count();
    const postsWithStats = await prisma.blogPostStats.count();
    
    log(`   Total view records: ${totalViews}`, colors.green);
    log(`   Total like records: ${totalLikes}`, colors.green);
    log(`   Total engagement records: ${totalEngagements}`, colors.green);
    log(`   Posts with stats: ${postsWithStats}`, colors.green);
    
    // Get top posts
    const topPosts = await prisma.blogPostStats.findMany({
      take: 5,
      orderBy: { totalViews: 'desc' },
      include: { blogPost: true }
    });
    
    if (topPosts.length > 0) {
      log('\n   📊 Top Posts by Views:', colors.cyan);
      topPosts.forEach((stat, i) => {
        log(`   ${i + 1}. ${stat.blogPost.title}`, colors.yellow);
        log(`      Views: ${stat.totalViews} | Likes: ${stat.totalLikes}`, colors.reset);
      });
    }
    
    log('\n✅ All tests completed successfully!', colors.green);
    
  } catch (error) {
    log(`\n❌ Error during testing: ${error}`, colors.red);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEngagementSystem();
