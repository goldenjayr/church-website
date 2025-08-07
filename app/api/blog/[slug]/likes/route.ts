import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-actions';

const prisma = new PrismaClient();

const schema = z.object({
  slug: z.string(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  // Get the current user from your auth system
  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const blogPost = await prisma.blogPost.findUnique({ where: { slug } });
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.blogPostLike.findUnique({
      where: {
        blogPostId_userId: {
          blogPostId: blogPost.id,
          userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }

    const like = await prisma.blogPostLike.create({
      data: {
        blogPostId: blogPost.id,
        userId,
      },
    });

    // Get updated like count
    const likeCount = await prisma.blogPostLike.count({
      where: { blogPostId: blogPost.id },
    });

    return NextResponse.json({ 
      success: true, 
      likeId: like.id,
      liked: true,
      likeCount 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  // Get the current user from your auth system
  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const blogPost = await prisma.blogPost.findUnique({ where: { slug } });
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const deleted = await prisma.blogPostLike.deleteMany({
      where: {
        blogPostId: blogPost.id,
        userId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    // Get updated like count
    const likeCount = await prisma.blogPostLike.count({
      where: { blogPostId: blogPost.id },
    });

    return NextResponse.json({ 
      success: true,
      liked: false,
      likeCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
