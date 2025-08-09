import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-actions';
import { UnifiedBlogEngagementService } from '@/lib/services/unified-blog-engagement.service';

const prisma = new PrismaClient();

function getClientIp(request: Request): string {
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
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Get the current user if authenticated
  const user = await getCurrentUser();
  const userId = user?.id || null;

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId || UnifiedBlogEngagementService.generateSessionId(ipAddress, userAgent);
    
    // Check both admin and user blog posts
    const [adminPost, userPost] = await Promise.all([
      prisma.blogPost.findUnique({ where: { slug } }),
      prisma.userBlogPost.findUnique({ where: { slug } })
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
    
    // Use unified service to track view with proper rate limiting and duplicate prevention
    const result = await UnifiedBlogEngagementService.trackView({
      blogPostId,
      blogType,
      userId,
      ipAddress,
      userAgent,
      referrer: body.referrer,
      sessionId,
    });
    
    if (!result.success) {
      // Don't return error for duplicate views or rate limiting
      // This prevents the UI from showing errors for normal behavior
      return NextResponse.json({ 
        success: false, 
        reason: result.reason,
        cached: result.reason === 'View already counted recently'
      }, { status: 200 });
    }
    
    return NextResponse.json({ 
      success: true, 
      sessionId,
      blogType
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

