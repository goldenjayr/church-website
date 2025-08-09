"use server"

import { prisma } from '@/lib/prisma-client'
import { getPublishedUserBlogPosts, searchUserBlogPosts } from '@/lib/user-blog-actions'
import { getPublishedBlogPosts } from '@/lib/public-blog-actions'

// Get combined blog posts (both community and church blogs)
export async function getCombinedBlogPosts() {
  try {
    // Get community blog posts
    const communityPosts = await getPublishedUserBlogPosts()
    
    // Get church blog posts with stats
    const churchPosts = await prisma.blogPost.findMany({
      where: {
        published: true
      },
      include: {
        author: true,
        member: {
          include: {
            position: true
          }
        },
        category: true,
        stats: true,
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform church posts to match community post structure
    const transformedChurchPosts = churchPosts.map(post => ({
      ...post,
      coverImage: post.imageUrl, // Map imageUrl to coverImage for consistency
      viewCount: post.stats?.totalViews || post._count?.views || 0,
      likeCount: post.stats?.totalLikes || post._count?.likes || 0,
      publishedAt: post.createdAt, // Use createdAt as publishedAt
      _count: {
        likes: post._count?.likes || 0,
        comments: post._count?.comments || 0
      },
      // Use member name if available, otherwise author name
      author: {
        ...post.author,
        name: post.member ? `${post.member.firstName} ${post.member.lastName}` : (post.authorName || post.author?.name || 'Church Admin'),
        profileImage: post.member?.imageUrl || post.author?.profileImage
      },
      postType: 'church' as const // Add identifier for church posts
    }))

    // Add post type identifier to community posts
    const transformedCommunityPosts = communityPosts.map(post => ({
      ...post,
      postType: 'community' as const
    }))

    // Combine and sort by published date
    const allPosts = [...transformedCommunityPosts, ...transformedChurchPosts]
    allPosts.sort((a, b) => {
      const aDate = new Date(a.publishedAt || a.createdAt)
      const bDate = new Date(b.publishedAt || b.createdAt)
      return bDate.getTime() - aDate.getTime()
    })

    return allPosts
  } catch (error) {
    console.error('Error fetching combined blog posts:', error)
    return []
  }
}

// Search combined blog posts (both community and church blogs)
export async function searchCombinedBlogPosts(query: string, tag?: string) {
  try {
    // Search community posts
    const communityResults = await searchUserBlogPosts(query, tag)
    
    // Search church posts
    const churchWhere: any = {
      published: true
    }

    if (query) {
      churchWhere.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (tag) {
      churchWhere.tags = { has: tag }
    }

    const churchPosts = await prisma.blogPost.findMany({
      where: churchWhere,
      include: {
        author: true,
        member: {
          include: {
            position: true
          }
        },
        category: true,
        stats: true,
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform church posts to match community post structure
    const transformedChurchPosts = churchPosts.map(post => ({
      ...post,
      coverImage: post.imageUrl,
      viewCount: post.stats?.totalViews || post._count?.views || 0,
      likeCount: post.stats?.totalLikes || post._count?.likes || 0,
      publishedAt: post.createdAt,
      _count: {
        likes: post._count?.likes || 0,
        comments: post._count?.comments || 0
      },
      // Use member name if available, otherwise author name
      author: {
        ...post.author,
        name: post.member ? `${post.member.firstName} ${post.member.lastName}` : (post.authorName || post.author?.name || 'Church Admin'),
        profileImage: post.member?.imageUrl || post.author?.profileImage
      },
      postType: 'church' as const
    }))

    // Add post type identifier to community posts
    const transformedCommunityPosts = communityResults.map(post => ({
      ...post,
      postType: 'community' as const
    }))

    // Combine and sort by published date
    const allPosts = [...transformedCommunityPosts, ...transformedChurchPosts]
    allPosts.sort((a, b) => {
      const aDate = new Date(a.publishedAt || a.createdAt)
      const bDate = new Date(b.publishedAt || b.createdAt)
      return bDate.getTime() - aDate.getTime()
    })

    return allPosts
  } catch (error) {
    console.error('Error searching combined blog posts:', error)
    return []
  }
}

// Get combined popular tags (from both community and church blogs)
export async function getCombinedPopularTags() {
  try {
    // Get community blog tags
    const communityPosts = await prisma.userBlogPost.findMany({
      where: {
        published: true
      },
      select: {
        tags: true
      }
    })

    // Get church blog tags
    const churchPosts = await prisma.blogPost.findMany({
      where: {
        published: true
      },
      select: {
        tags: true
      }
    })

    // Combine all tags
    const tagCounts = new Map<string, number>()
    
    // Count community blog tags
    communityPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    
    // Count church blog tags
    churchPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag)

    return sortedTags
  } catch (error) {
    console.error('Error fetching combined popular tags:', error)
    return []
  }
}

