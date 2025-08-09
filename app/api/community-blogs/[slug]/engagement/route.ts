import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-actions';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Handle both JSON and FormData (from sendBeacon)
    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
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
    
    const { sessionId, scrollDepth, timeOnPage, clicks } = body;
    
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

    // For now, just log the engagement metrics
    // You could create a separate table for detailed engagement tracking
    console.log('Community Blog Engagement:', {
      postId: post.id,
      userId: user?.id,
      sessionId,
      scrollDepth,
      timeOnPage,
      clicks,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}
