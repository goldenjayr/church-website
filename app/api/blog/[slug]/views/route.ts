import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-actions';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const schema = z.object({
  slug: z.string(),
});

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
    // Check both church and community blog posts
    const [churchPost, communityPost] = await Promise.all([
      prisma.blogPost.findUnique({ where: { slug } }),
      prisma.userBlogPost.findUnique({ where: { slug } })
    ]);
    
    // Generate a proper session ID from the request body or create one
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId || `${ipAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle community blog post
    if (communityPost) {
      // Increment view count for community post
      await prisma.userBlogPost.update({
        where: { id: communityPost.id },
        data: { viewCount: { increment: 1 } }
      });
      
      return NextResponse.json({ 
        success: true, 
        sessionId,
        postType: 'community'
      }, { status: 201 });
    }
    
    // Handle church blog post
    const blogPost = churchPost;
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Check for duplicate view in the last 30 minutes
    const duplicateKey = `duplicate:${sessionId}:${blogPost.id}`;
    const isDuplicate = await redis.get(duplicateKey);
    
    if (isDuplicate) {
      return NextResponse.json({ 
        success: false, 
        reason: 'View already counted',
        cached: true 
      }, { status: 200 });
    }
    
    // Rate limiting check - max 10 views per IP per hour for the same post
    const rateLimitKey = `view:${ipAddress}:${blogPost.id}`;
    const viewCount = await redis.incr(rateLimitKey);
    
    if (viewCount === 1) {
      // Set expiry for 1 hour
      await redis.expire(rateLimitKey, 3600);
    } else if (viewCount > 10) {
      // More than 10 views from same IP in an hour for this post
      return NextResponse.json({ 
        success: false, 
        reason: 'Rate limit exceeded' 
      }, { status: 429 });
    }
    
    // Mark this view to prevent duplicates for 30 minutes
    await redis.set(duplicateKey, '1', { ex: 1800 });

    // Record the view for church blog
    const view = await prisma.blogPostView.create({
      data: {
        blogPostId: blogPost.id,
        userId,
        sessionId,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ 
      success: true, 
      viewId: view.id,
      sessionId // Return the session ID for the client to use
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

