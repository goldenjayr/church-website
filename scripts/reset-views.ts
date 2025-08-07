import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetViews() {
  try {
    console.log('🔄 Starting to reset all view counts...');
    
    // Delete all individual view records
    const viewsDeleted = await prisma.blogPostView.deleteMany({});
    console.log(`🗑️  Deleted ${viewsDeleted.count} individual view records`);
    
    // Reset all blog post stats
    const statsReset = await prisma.blogPostStats.updateMany({
      data: {
        totalViews: 0,
        uniqueViews: 0,
        registeredViews: 0,
        anonymousViews: 0,
        avgViewDuration: null,
        lastViewedAt: null,
        dailyViews: {},
        hourlyViews: {}
      }
    });
    console.log(`📊 Reset stats for ${statsReset.count} blog posts`);
    
    // Also delete any user engagement records
    const engagementsDeleted = await prisma.userEngagement.deleteMany({});
    console.log(`🔗 Deleted ${engagementsDeleted.count} user engagement records`);
    
    // Show current state
    const posts = await prisma.blogPost.findMany({
      select: {
        title: true,
        slug: true,
        stats: {
          select: {
            totalViews: true,
            uniqueViews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n✅ Successfully reset all view counts!');
    console.log('\n📈 Current blog post view counts:');
    posts.forEach(post => {
      const views = post.stats?.totalViews || 0;
      const uniqueViews = post.stats?.uniqueViews || 0;
      console.log(`  - ${post.title}:`);
      console.log(`    Total views: ${views}, Unique views: ${uniqueViews}`);
    });
    
  } catch (error) {
    console.error('❌ Error resetting views:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetViews();
