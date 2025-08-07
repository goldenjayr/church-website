import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-actions';

const prisma = new PrismaClient();

const paramsSchema = z.object({
  slug: z.string(),
});

const bodySchema = z.object({
  sessionId: z.string(),
  scrollDepth: z.number().min(0).max(100),
  timeOnPage: z.number().min(0),
  clicks: z.number().min(0),
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
    // Handle both JSON and FormData (from sendBeacon)
    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        sessionId: formData.get('sessionId'),
        scrollDepth: parseFloat(formData.get('scrollDepth') as string),
        timeOnPage: parseInt(formData.get('timeOnPage') as string),
        clicks: parseInt(formData.get('clicks') as string),
      };
    } else {
      // Try to parse as FormData for sendBeacon
      const formData = await request.formData();
      body = {
        sessionId: formData.get('sessionId'),
        scrollDepth: parseFloat(formData.get('scrollDepth') as string),
        timeOnPage: parseInt(formData.get('timeOnPage') as string),
        clicks: parseInt(formData.get('clicks') as string),
      };
    }

    const bodyValidation = bodySchema.safeParse(body);
    if (!bodyValidation.success) {
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: bodyValidation.error.errors 
      }, { status: 400 });
    }

    const { sessionId, scrollDepth, timeOnPage, clicks } = bodyValidation.data;

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

    // Update or create engagement record
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
        scrollDepth,
        timeOnPage,
        clicks,
      },
      update: {
        scrollDepth: {
          set: Math.max(scrollDepth), // Keep the maximum scroll depth
        },
        timeOnPage: {
          set: timeOnPage, // Update with latest time
        },
        clicks: {
          increment: clicks, // Add to existing clicks
        },
        updatedAt: new Date(),
      },
    });

    // Update view duration if this session has a view record
    await prisma.blogPostView.updateMany({
      where: {
        sessionId,
        blogPostId: blogPost.id,
      },
      data: {
        viewDuration: timeOnPage,
      },
    });

    // Update average view duration in stats
    const avgDuration = await prisma.blogPostView.aggregate({
      where: {
        blogPostId: blogPost.id,
        viewDuration: { not: null },
      },
      _avg: {
        viewDuration: true,
      },
    });

    await prisma.blogPostStats.update({
      where: { blogPostId: blogPost.id },
      data: {
        avgViewDuration: avgDuration._avg.viewDuration || 0,
        updatedAt: new Date(),
      },
    }).catch(() => {
      // Stats might not exist yet, that's okay
    });

    return NextResponse.json({ 
      success: true, 
      engagementId: engagement.id 
    });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
