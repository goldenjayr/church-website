import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-actions';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    
    // Get the user blog post
    const post = await prisma.userBlogPost.findUnique({
      where: { slug },
      select: { id: true, likeCount: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.userBlogLike.findUnique({
      where: {
        userBlogPostId_userId: {
          userBlogPostId: post.id,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Create the like
    await prisma.userBlogLike.create({
      data: {
        userBlogPostId: post.id,
        userId: user.id,
      },
    });

    // Update like count
    const updatedPost = await prisma.userBlogPost.update({
      where: { id: post.id },
      data: {
        likeCount: post.likeCount + 1,
      },
      select: {
        likeCount: true,
      },
    });

    // Clear cache
    await redis.del(`community-blog:stats:${slug}`);

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updatedPost.likeCount,
    });
  } catch (error) {
    console.error('Error adding like:', error);
    return NextResponse.json(
      { error: 'Failed to add like' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    
    // Get the user blog post
    const post = await prisma.userBlogPost.findUnique({
      where: { slug },
      select: { id: true, likeCount: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if like exists
    const existingLike = await prisma.userBlogLike.findUnique({
      where: {
        userBlogPostId_userId: {
          userBlogPostId: post.id,
          userId: user.id,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: 'Not liked' },
        { status: 400 }
      );
    }

    // Delete the like
    await prisma.userBlogLike.delete({
      where: { id: existingLike.id },
    });

    // Update like count
    const updatedPost = await prisma.userBlogPost.update({
      where: { id: post.id },
      data: {
        likeCount: Math.max(0, post.likeCount - 1),
      },
      select: {
        likeCount: true,
      },
    });

    // Clear cache
    await redis.del(`community-blog:stats:${slug}`);

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: updatedPost.likeCount,
    });
  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json(
      { error: 'Failed to remove like' },
      { status: 500 }
    );
  }
}
