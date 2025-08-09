import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-actions';
import { UnifiedBlogEngagementService } from '@/lib/services/unified-blog-engagement.service';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get current user
    const user = await getCurrentUser();
    const userId = user?.id;
    
    // Get the user blog post
    const post = await prisma.userBlogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Use unified service to get stats
    const stats = await UnifiedBlogEngagementService.getBlogPostStats(
      post.id,
      'user',
      userId
    );

    return NextResponse.json({
      totalViews: stats.totalViews,
      totalLikes: stats.totalLikes,
      totalComments: stats.totalComments || 0,
      hasLiked: stats.hasLiked,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
