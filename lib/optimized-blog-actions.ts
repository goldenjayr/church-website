"use server"

import { prisma } from '@/lib/prisma-client'

// Optimized function to get combined blog posts with minimal data fetching
export async function getOptimizedCombinedBlogPosts() {
  try {
    // Fetch both types of posts in parallel for better performance
    const [communityPosts, churchPosts] = await Promise.all([
      // Community posts - fetch only needed fields
      prisma.userBlogPost.findMany({
        where: {
          published: true
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
          viewCount: true,
          likeCount: true,
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        }
      }),
      
      // Church posts - fetch only needed fields with optimized includes
      prisma.blogPost.findMany({
        where: {
          published: true
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          tags: true,
          createdAt: true,
          authorName: true,
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          member: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
              position: {
                select: {
                  name: true
                }
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          stats: {
            select: {
              totalViews: true,
              totalLikes: true
            }
          },
          _count: {
            select: {
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
    ])

    // Transform community posts efficiently
    const transformedCommunityPosts = communityPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      imageUrl: null,
      tags: post.tags,
      publishedAt: post.publishedAt || post.createdAt,
      createdAt: post.createdAt,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      author: post.author,
      category: null,
      _count: {
        likes: post.likeCount,
        comments: post._count.comments
      },
      postType: 'community' as const
    }))

    // Transform church posts efficiently
    const transformedChurchPosts = churchPosts.map(post => {
      // Determine the author name
      let authorName = 'Church Admin'
      let authorImage = post.author?.profileImage
      
      if (post.member) {
        authorName = `${post.member.firstName} ${post.member.lastName}`
        authorImage = post.member.imageUrl || authorImage
        // Position removed from display name
      } else if (post.authorName) {
        authorName = post.authorName
      } else if (post.author?.name) {
        authorName = post.author.name
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.imageUrl,
        imageUrl: post.imageUrl,
        tags: post.tags,
        publishedAt: post.createdAt,
        createdAt: post.createdAt,
        viewCount: post.stats?.totalViews || 0,
        likeCount: post.stats?.totalLikes || post._count.likes || 0,
        author: {
          id: post.author?.id || 'church',
          name: authorName,
          profileImage: authorImage
        },
        category: post.category,
        _count: {
          likes: post._count.likes || 0,
          comments: post._count.comments || 0
        },
        postType: 'church' as const
      }
    })

    // Combine and sort
    const allPosts = [...transformedCommunityPosts, ...transformedChurchPosts]
    allPosts.sort((a, b) => {
      const aDate = new Date(a.publishedAt)
      const bDate = new Date(b.publishedAt)
      return bDate.getTime() - aDate.getTime()
    })

    return allPosts
  } catch (error) {
    console.error('Error fetching optimized combined blog posts:', error)
    return []
  }
}

// Optimized search function
export async function searchOptimizedCombinedPosts(query: string, tag?: string) {
  try {
    const searchWhere = query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { excerpt: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {}

    const tagWhere = tag ? { tags: { has: tag } } : {}

    // Parallel search queries
    const [communityPosts, churchPosts] = await Promise.all([
      // Community posts search
      prisma.userBlogPost.findMany({
        where: {
          published: true,
          ...searchWhere,
          ...tagWhere
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
          viewCount: true,
          likeCount: true,
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        }
      }),
      
      // Church posts search
      prisma.blogPost.findMany({
        where: {
          published: true,
          ...searchWhere,
          ...tagWhere
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          tags: true,
          createdAt: true,
          authorName: true,
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          member: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
              position: {
                select: {
                  name: true
                }
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          stats: {
            select: {
              totalViews: true,
              totalLikes: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    // Use the same transformation logic as above
    const transformedCommunityPosts = communityPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      imageUrl: null,
      tags: post.tags,
      publishedAt: post.publishedAt || post.createdAt,
      createdAt: post.createdAt,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      author: post.author,
      category: null,
      _count: {
        likes: post.likeCount,
        comments: post._count.comments
      },
      postType: 'community' as const
    }))

    const transformedChurchPosts = churchPosts.map(post => {
      let authorName = 'Church Admin'
      let authorImage = post.author?.profileImage
      
      if (post.member) {
        authorName = `${post.member.firstName} ${post.member.lastName}`
        authorImage = post.member.imageUrl || authorImage
        // Position removed from display name
      } else if (post.authorName) {
        authorName = post.authorName
      } else if (post.author?.name) {
        authorName = post.author.name
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.imageUrl,
        imageUrl: post.imageUrl,
        tags: post.tags,
        publishedAt: post.createdAt,
        createdAt: post.createdAt,
        viewCount: post.stats?.totalViews || 0,
        likeCount: post.stats?.totalLikes || post._count.likes || 0,
        author: {
          id: post.author?.id || 'church',
          name: authorName,
          profileImage: authorImage
        },
        category: post.category,
        _count: {
          likes: post._count.likes || 0,
          comments: post._count.comments || 0
        },
        postType: 'church' as const
      }
    })

    // Combine and sort
    const allPosts = [...transformedCommunityPosts, ...transformedChurchPosts]
    allPosts.sort((a, b) => {
      const aDate = new Date(a.publishedAt)
      const bDate = new Date(b.publishedAt)
      return bDate.getTime() - aDate.getTime()
    })

    return allPosts
  } catch (error) {
    console.error('Error searching optimized posts:', error)
    return []
  }
}
