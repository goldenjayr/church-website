import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getCurrentUser } from '@/lib/auth-actions';
import { unstable_cache } from 'next/cache';

// Cache stats for 60 seconds to reduce database load
const getCachedStats = unstable_cache(
  async (blogPostId: string) => {
    // Use a single optimized query with aggregations
    const [statsData, viewAggregates] = await Promise.all([
      // Get existing stats if available
      prisma.blogPostStats.findUnique({
        where: { blogPostId },
      }),
      // Single aggregation query for all view-related stats
      prisma.$queryRaw<Array<{
        total_views: bigint;
        unique_views: bigint;
        registered_views: bigint;
        avg_duration: number | null;
        last_viewed: Date | null;
      }>>`
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT "sessionId") as unique_views,
          COUNT(CASE WHEN "userId" IS NOT NULL THEN 1 END) as registered_views,
          AVG("viewDuration") as avg_duration,
          MAX("createdAt") as last_viewed
        FROM "BlogPostView"
        WHERE "blogPostId" = ${blogPostId}
      `,
    ]);

    const viewStats = viewAggregates[0] || {
      total_views: 0n,
      unique_views: 0n,
      registered_views: 0n,
      avg_duration: null,
      last_viewed: null,
    };

    // Get total likes count
    const totalLikes = await prisma.blogPostLike.count({
      where: { blogPostId },
    });

    const totalViews = Number(viewStats.total_views);
    const uniqueViews = Number(viewStats.unique_views);
    const registeredViews = Number(viewStats.registered_views);
    const anonymousViews = totalViews - registeredViews;
    const avgViewDuration = viewStats.avg_duration;
    const lastViewedAt = viewStats.last_viewed;

    // Only update stats if they don't exist or are significantly outdated
    const shouldUpdate = !statsData || 
      Math.abs(statsData.totalViews - totalViews) > 10 ||
      Math.abs(statsData.totalLikes - totalLikes) > 5 ||
      (statsData.updatedAt && Date.now() - statsData.updatedAt.getTime() > 300000); // 5 minutes

    if (shouldUpdate) {
      const updatedStats = await prisma.blogPostStats.upsert({
        where: { blogPostId },
        update: {
          totalViews,
          uniqueViews,
          registeredViews,
          anonymousViews,
          totalLikes,
          avgViewDuration,
          lastViewedAt,
          updatedAt: new Date(),
        },
        create: {
          blogPostId,
          totalViews,
          uniqueViews,
          registeredViews,
          anonymousViews,
          totalLikes,
          avgViewDuration,
          lastViewedAt,
          updatedAt: new Date(),
        },
      });
      return updatedStats;
    }

    return statsData || {
      blogPostId,
      totalViews,
      uniqueViews,
      registeredViews,
      anonymousViews,
      totalLikes,
      avgViewDuration,
      lastViewedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  ['blog-stats'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['blog-stats'],
  }
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  
  try {
    // Parallel fetch: blog post and current user
    const [blogPost, user] = await Promise.all([
      prisma.blogPost.findUnique({ 
        where: { slug },
        select: { id: true }
      }),
      getCurrentUser(),
    ]);
    
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Parallel fetch: stats and user like status
    const [stats, hasLiked] = await Promise.all([
      getCachedStats(blogPost.id),
      user ? prisma.blogPostLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: blogPost.id,
            userId: user.id,
          },
        },
        select: { id: true }, // Only select id to minimize data transfer
      }).then(like => !!like) : Promise.resolve(false),
    ]);

    return NextResponse.json({
      totalViews: stats.totalViews,
      uniqueViews: stats.uniqueViews,
      totalLikes: stats.totalLikes,
      hasLiked,
      registeredViews: stats.registeredViews,
      anonymousViews: stats.anonymousViews,
      avgViewDuration: stats.avgViewDuration,
      lastViewedAt: stats.lastViewedAt,
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
