import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-actions';

const prisma = new PrismaClient();

const paramsSchema = z.object({
  slug: z.string(),
});

const bodySchema = z.object({
  platform: z.enum(['twitter', 'facebook', 'linkedin', 'copy', 'other']),
  sessionId: z.string(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const bodyValidation = bodySchema.safeParse(body);
    
    if (!bodyValidation.success) {
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: bodyValidation.error.errors 
      }, { status: 400 });
    }

    const { platform, sessionId } = bodyValidation.data;

    // Get the blog post
    const blogPost = await prisma.blogPost.findUnique({ 
      where: { slug },
      select: { id: true }
    });
    
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get current user if authenticated
    const user = await getCurrentUser();
    const userId = user?.id || null;

    // Update engagement record to track share
    const engagement = await prisma.userEngagement.upsert({
      where: {
        sessionId_blogPostId: {
          sessionId,
          blogPostId: blogPost.id,
        },
      },
      create: {
        userId,
        sessionId,
        blogPostId: blogPost.id,
        shares: 1,
        scrollDepth: 0,
        timeOnPage: 0,
        clicks: 0,
      },
      update: {
        shares: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });

    // You could also create a separate ShareTracking table for more detailed analytics
    // For now, we're just incrementing the share count in the engagement record

    return NextResponse.json({ 
      success: true,
      platform,
      totalShares: engagement.shares,
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
