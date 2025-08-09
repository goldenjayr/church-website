import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { BlogEngagementService } from '@/lib/services/blog-engagement.service';
import { getCurrentUser } from '@/lib/auth-actions';
import requestIp from 'request-ip';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { referrer, sessionId } = await request.json();
    
    // Get the user blog post
    const post = await prisma.userBlogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get current user (if authenticated)
    const user = await getCurrentUser();
    
    // Get IP address and user agent
    const ipAddress = requestIp.getClientIp(request) || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Track the view
    const result = await BlogEngagementService.trackCommunityView({
      blogPostId: post.id,
      userId: user?.id,
      ipAddress,
      userAgent,
      referrer,
      sessionId: sessionId || BlogEngagementService.generateSessionId(ipAddress, userAgent),
    });

    if (result.success) {
      // Update view count on the post
      await prisma.userBlogPost.update({
        where: { id: post.id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: result.success,
      sessionId: sessionId || BlogEngagementService.generateSessionId(ipAddress, userAgent),
      cached: !result.success && result.reason === 'Duplicate view',
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
