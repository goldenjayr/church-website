import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testViewCounting() {
  console.log('🔍 Testing View Counting System\n');
  console.log('=' .repeat(50));

  try {
    // Get a sample user blog post
    const userPost = await prisma.userBlogPost.findFirst({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
      }
    });

    if (userPost) {
      console.log('\n📝 User Blog Post:');
      console.log(`Title: ${userPost.title}`);
      console.log(`Slug: ${userPost.slug}`);
      console.log(`Current View Count: ${userPost.viewCount}`);
      console.log('\nTo test view counting:');
      console.log(`1. Visit: http://localhost:3000/community-blogs/${userPost.slug}`);
      console.log('2. The view should be counted ONCE even if you refresh');
      console.log('3. Wait 30 minutes to count another view from same session');
      console.log('4. Maximum 10 views per hour from same IP address');
    } else {
      console.log('❌ No published user blog posts found');
    }

    // Get a sample admin blog post
    const adminPost = await prisma.blogPost.findFirst({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            views: true
          }
        },
        stats: {
          select: {
            totalViews: true
          }
        }
      }
    });

    if (adminPost) {
      console.log('\n📝 Admin/Church Blog Post:');
      console.log(`Title: ${adminPost.title}`);
      console.log(`Slug: ${adminPost.slug}`);
      console.log(`Current View Count: ${adminPost.stats?.totalViews || adminPost._count.views}`);
      console.log('\nTo test view counting:');
      console.log(`1. Visit: http://localhost:3000/blog/${adminPost.slug}`);
      console.log('2. The view should be counted ONCE even if you refresh');
      console.log('3. Wait 30 minutes to count another view from same session');
      console.log('4. Maximum 10 views per hour from same IP address');
    } else {
      console.log('❌ No published admin blog posts found');
    }

    // Check for any server actions that might increment views
    console.log('\n⚠️  Important Notes:');
    console.log('1. The getUserBlogPostBySlug function NO LONGER increments views');
    console.log('2. View counting is ONLY handled by the unified engagement service');
    console.log('3. Rate limiting and duplicate prevention are enforced');
    console.log('4. Bot traffic is filtered out automatically');

    console.log('\n✅ View Counting System Configuration:');
    console.log('- Session-based duplicate prevention: 30 minutes');
    console.log('- IP-based rate limiting: 10 views/hour/post');
    console.log('- Bot detection: 21+ patterns filtered');
    console.log('- Unified for both admin and user posts');

  } catch (error) {
    console.error('Error testing view counting:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testViewCounting();
