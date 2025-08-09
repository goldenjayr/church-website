import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UnifiedBlogEngagementService } from '@/lib/services/unified-blog-engagement.service';
import { getCurrentUser } from '@/lib/auth-actions';

const prisma = new PrismaClient();

function getClientIp(request: NextRequest): string {
  // Get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1'; // Default for local development
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    
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
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Generate or use existing session ID
    const sessionId = body.sessionId || UnifiedBlogEngagementService.generateSessionId(ipAddress, userAgent);
    
    // Use unified service to track the view with proper rate limiting
    const result = await UnifiedBlogEngagementService.trackView({
      blogPostId: post.id,
      blogType: 'user',
      userId: user?.id,
      ipAddress,
      userAgent,
      referrer: body.referrer,
      sessionId,
    });

    // Note: View count is now incremented inside the unified service
    // No need to increment here separately

    return NextResponse.json({
      success: result.success,
      sessionId,
      cached: result.reason === 'View already counted recently',
      reason: result.reason,
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
