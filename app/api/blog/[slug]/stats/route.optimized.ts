import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getCurrentUser } from '@/lib/auth-actions';
import { unstable_cache } from 'next/cache';

// Cache stats for 60 seconds to reduce database load
const getCachedStats = unstable_cache(
  async (blogPostId: string) => {
    // Get existing stats if available
    const statsData = await prisma.blogPostStats.findUnique({
      where: { blogPostId },
    });

    // Check if stats need updating (older than 5 minutes or don't exist)
    const needsUpdate = !statsData || 
      (statsData.updatedAt && Date.now() - statsData.updatedAt.getTime() > 300000);

    if (!needsUpdate && statsData) {
      return statsData;
    }

    // Parallel fetch all necessary data
    const [
      totalViews,
      uniqueViewsData,
      totalLikes,
      registeredViews,
      viewsWithDuration,
      lastView
    ] = await Promise.all([
      // Total view count
      prisma.blogPostView.count({ 
        where: { blogPostId } 
      }),
      // Unique sessions (for unique views)
      prisma.blogPostView.findMany({
        where: { blogPostId },
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      // Total likes
      prisma.blogPostLike.count({ 
        where: { blogPostId } 
      }),
      // Registered user views
      prisma.blogPostView.count({
        where: {
          blogPostId,
          userId: { not: null },
        },
      }),
      // Views with duration for average calculation
      prisma.blogPostView.findMany({
        where: {
          blogPostId,
          viewDuration: { not: null },
        },
        select: { viewDuration: true },
      }),
      // Last view timestamp
      prisma.blogPostView.findFirst({
        where: { blogPostId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    // Calculate derived values
    const uniqueViews = uniqueViewsData.length;
    const anonymousViews = totalViews - registeredViews;
    
    // Calculate average duration efficiently
    let avgViewDuration: number | null = null;
    if (viewsWithDuration.length > 0) {
      const totalDuration = viewsWithDuration.reduce(
        (sum, view) => sum + (view.viewDuration || 0), 
        0
      );
      avgViewDuration = totalDuration / viewsWithDuration.length;
    }

    const lastViewedAt = lastView?.createdAt || null;

    // Upsert stats
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

    // Set cache headers for client-side caching
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return NextResponse.json({
      totalViews: stats.totalViews,
      uniqueViews: stats.uniqueViews,
      totalLikes: stats.totalLikes,
      hasLiked,
      registeredViews: stats.registeredViews,
      anonymousViews: stats.anonymousViews,
      avgViewDuration: stats.avgViewDuration,
      lastViewedAt: stats.lastViewedAt,
    }, { headers });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
