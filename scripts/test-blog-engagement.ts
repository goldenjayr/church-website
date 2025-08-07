import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBlogEngagement() {
  console.log('🧪 Testing Blog Engagement System Setup...\n');
  
  try {
    // 1. Check if new tables exist
    console.log('✅ Checking database tables...');
    
    const viewsCount = await prisma.blogPostView.count();
    console.log(`  - BlogPostView table: ✓ (${viewsCount} records)`);
    
    const likesCount = await prisma.blogPostLike.count();
    console.log(`  - BlogPostLike table: ✓ (${likesCount} records)`);
    
    const statsCount = await prisma.blogPostStats.count();
    console.log(`  - BlogPostStats table: ✓ (${statsCount} records)`);
    
    const engagementCount = await prisma.userEngagement.count();
    console.log(`  - UserEngagement table: ✓ (${engagementCount} records)`);
    
    const rateLimitCount = await prisma.rateLimit.count();
    console.log(`  - RateLimit table: ✓ (${rateLimitCount} records)`);
    
    // 2. Check if blog posts exist
    console.log('\n✅ Checking existing blog posts...');
    const posts = await prisma.blogPost.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        published: true
      }
    });
    
    if (posts.length === 0) {
      console.log('  ⚠️  No blog posts found. Creating a sample post...');
      
      // Get or create a user
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'admin@example.com',
            password: 'hashed_password',
            name: 'Admin User',
            role: 'ADMIN'
          }
        });
      }
      
      // Create a sample blog post
      const samplePost = await prisma.blogPost.create({
        data: {
          title: 'Test Blog Post for Engagement System',
          slug: 'test-engagement-post',
          content: '<p>This is a test blog post to verify the engagement system.</p>',
          excerpt: 'Testing the new views and likes system',
          published: true,
          authorId: user.id,
          tags: ['test', 'engagement', 'demo']
        }
      });
      
      console.log(`  ✓ Created sample post: "${samplePost.title}" (slug: ${samplePost.slug})`);
    } else {
      console.log(`  ✓ Found ${posts.length} blog posts:`);
      posts.forEach(post => {
        console.log(`    - "${post.title}" (slug: ${post.slug}, published: ${post.published})`);
      });
    }
    
    // 3. Test creating a view
    console.log('\n✅ Testing view tracking...');
    const testPost = posts[0] || await prisma.blogPost.findFirst();
    
    if (testPost) {
      const view = await prisma.blogPostView.create({
        data: {
          blogPostId: testPost.id,
          sessionId: `test-session-${Date.now()}`,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Script',
          isBot: false
        }
      });
      console.log(`  ✓ Successfully created test view for post: ${testPost.title}`);
      
      // Clean up test view
      await prisma.blogPostView.delete({ where: { id: view.id } });
      console.log(`  ✓ Cleaned up test view`);
    }
    
    // 4. Check Redis connection (if configured)
    console.log('\n✅ Checking Redis configuration...');
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!redisUrl || redisUrl.includes('your-redis-url')) {
      console.log('  ⚠️  Redis not configured. Please update your .env file with Upstash credentials.');
      console.log('      Visit https://console.upstash.com to create a free Redis database.');
    } else {
      console.log('  ✓ Redis URL configured');
      console.log('  ✓ Redis token configured');
      
      // Test Redis connection
      try {
        const response = await fetch(`${redisUrl}/ping`, {
          headers: {
            Authorization: `Bearer ${redisToken}`
          }
        });
        
        if (response.ok) {
          console.log('  ✓ Redis connection successful!');
        } else {
          console.log('  ❌ Redis connection failed. Check your credentials.');
        }
      } catch (error) {
        console.log('  ❌ Could not connect to Redis:', error.message);
      }
    }
    
    console.log('\n✅ Blog Engagement System is ready to use!');
    console.log('\n📚 Next steps:');
    console.log('1. Update your .env file with Upstash Redis credentials');
    console.log('2. Visit any blog post to see the engagement system in action');
    console.log('3. Check the /docs/BLOG_ENGAGEMENT_SETUP.md for detailed documentation');
    
  } catch (error) {
    console.error('❌ Error testing blog engagement system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBlogEngagement();
