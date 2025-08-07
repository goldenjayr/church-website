import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-actions';

const prisma = new PrismaClient();

const schema = z.object({
  slug: z.string(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  
  try {
    // Get the blog post
    const blogPost = await prisma.blogPost.findUnique({ 
      where: { slug },
      select: { id: true }
    });
    
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get current user to check if they've liked the post
    const user = await getCurrentUser();
    let hasLiked = false;
    
    if (user) {
      const userLike = await prisma.blogPostLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: blogPost.id,
            userId: user.id,
          },
        },
      });
      hasLiked = !!userLike;
    }

    // Get or create stats
    let stats = await prisma.blogPostStats.findUnique({
      where: { blogPostId: blogPost.id },
    });

    // Always get fresh counts
    const [totalViews, uniqueViewsData, totalLikes] = await Promise.all([
      prisma.blogPostView.count({ 
        where: { blogPostId: blogPost.id } 
      }),
      prisma.blogPostView.groupBy({
        by: ['sessionId'],
        where: { blogPostId: blogPost.id },
        _count: true,
      }),
      prisma.blogPostLike.count({ 
        where: { blogPostId: blogPost.id } 
      }),
    ]);

    const uniqueViews = uniqueViewsData.length;
    
    // Count registered vs anonymous views
    const registeredViews = await prisma.blogPostView.count({
      where: {
        blogPostId: blogPost.id,
        userId: { not: null },
      },
    });

    const anonymousViews = totalViews - registeredViews;
    
    // Calculate average view duration
    const avgDuration = await prisma.blogPostView.aggregate({
      where: {
        blogPostId: blogPost.id,
        viewDuration: { not: null },
      },
      _avg: {
        viewDuration: true,
      },
    });
    
    // Get last viewed time
    const lastView = await prisma.blogPostView.findFirst({
      where: { blogPostId: blogPost.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (!stats) {
      // Create stats entry if it doesn't exist
      stats = await prisma.blogPostStats.create({
        data: {
          blogPostId: blogPost.id,
          totalViews,
          uniqueViews,
          registeredViews,
          anonymousViews,
          totalLikes,
          avgViewDuration: avgDuration._avg.viewDuration || null,
          lastViewedAt: lastView?.createdAt || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Update existing stats
      stats = await prisma.blogPostStats.update({
        where: { blogPostId: blogPost.id },
        data: {
          totalViews,
          uniqueViews,
          registeredViews,
          anonymousViews,
          totalLikes,
          avgViewDuration: avgDuration._avg.viewDuration || null,
          lastViewedAt: lastView?.createdAt || null,
          updatedAt: new Date(),
        },
      });
    }

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
