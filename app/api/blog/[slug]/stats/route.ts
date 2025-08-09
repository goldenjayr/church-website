import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getCurrentUser } from '@/lib/auth-actions';
import { UnifiedBlogEngagementService } from '@/lib/services/unified-blog-engagement.service';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  try {
    // Get current user
    const user = await getCurrentUser();
    const userId = user?.id;

    // Check both admin and user blog posts
    const [adminPost, userPost] = await Promise.all([
      prisma.blogPost.findUnique({
        where: { slug },
        select: { id: true }
      }),
      prisma.userBlogPost.findUnique({
        where: { slug },
        select: { id: true }
      }),
    ]);

    // Determine blog type and post ID
    let blogType: 'admin' | 'user';
    let blogPostId: string;
    
    if (adminPost) {
      blogType = 'admin';
      blogPostId = adminPost.id;
    } else if (userPost) {
      blogType = 'user';
      blogPostId = userPost.id;
    } else {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Use unified service to get stats
    const stats = await UnifiedBlogEngagementService.getBlogPostStats(
      blogPostId,
      blogType,
      userId
    );

    return NextResponse.json({
      totalViews: stats.totalViews,
      uniqueViews: stats.totalViews, // For simplicity, using total views
      totalLikes: stats.totalLikes,
      totalComments: stats.totalComments || 0,
      hasLiked: stats.hasLiked,
      lastViewedAt: stats.lastViewedAt,
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
