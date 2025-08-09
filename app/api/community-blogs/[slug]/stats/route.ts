import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-actions';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Try to get from cache first
    const cacheKey = `community-blog:stats:${slug}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // Get the user blog post with stats
    const post = await prisma.userBlogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        viewCount: true,
        likeCount: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if current user has liked
    const user = await getCurrentUser();
    const hasLiked = user ? post.likes.some(like => like.userId === user.id) : false;

    const stats = {
      totalViews: post.viewCount,
      totalLikes: post.likeCount,
      totalComments: post._count.comments,
      hasLiked,
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(stats), { ex: 300 });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
