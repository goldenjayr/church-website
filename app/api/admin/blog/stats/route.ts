import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, ensure all blog posts have stats records
    const allPosts = await prisma.blogPost.findMany({
      select: { id: true }
    })

    // Create missing BlogPostStats records
    for (const post of allPosts) {
      const existingStats = await prisma.blogPostStats.findUnique({
        where: { blogPostId: post.id }
      })

      if (!existingStats) {
        // Count actual views and likes
        const [viewCount, likeCount, uniqueViews] = await Promise.all([
          prisma.blogPostView.count({ where: { blogPostId: post.id } }),
          prisma.blogPostLike.count({ where: { blogPostId: post.id } }),
          prisma.blogPostView.findMany({
            where: { blogPostId: post.id },
            select: { sessionId: true },
            distinct: ['sessionId']
          })
        ])

        await prisma.blogPostStats.create({
          data: {
            blogPostId: post.id,
            totalViews: viewCount,
            uniqueViews: uniqueViews.length,
            totalLikes: likeCount,
            registeredViews: 0,
            anonymousViews: viewCount,
          }
        })
      } else {
        // Update existing stats with actual counts
        const [viewCount, likeCount, views] = await Promise.all([
          prisma.blogPostView.count({ where: { blogPostId: post.id } }),
          prisma.blogPostLike.count({ where: { blogPostId: post.id } }),
          prisma.blogPostView.findMany({
            where: { blogPostId: post.id },
            select: { sessionId: true, userId: true }
          })
        ])

        const uniqueViews = new Set(views.map(v => v.sessionId)).size
        const registeredViews = views.filter(v => v.userId).length
        const anonymousViews = views.filter(v => !v.userId).length

        await prisma.blogPostStats.update({
          where: { blogPostId: post.id },
          data: {
            totalViews: viewCount,
            uniqueViews: uniqueViews,
            totalLikes: likeCount,
            registeredViews: registeredViews,
            anonymousViews: anonymousViews,
          }
        })
      }
    }

    // Get all blog posts with comprehensive stats
    const blogPosts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        authorName: true,
        author: {
          select: {
            name: true,
            email: true,
          }
        },
        category: {
          select: {
            name: true,
            color: true,
          }
        },
        stats: true,
        _count: {
          select: {
            views: true,
            likes: true,
            engagements: true,
          }
        },
        likes: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // Limit to recent 10 likes for overview
        },
        views: {
          select: {
            viewDuration: true,
            createdAt: true,
            country: true,
            city: true,
            referrer: true,
            isBot: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // Recent 10 views for overview
        },
        engagements: {
          select: {
            scrollDepth: true,
            timeOnPage: true,
            clicks: true,
            shares: true,
            comments: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // Recent 10 engagements for overview
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate aggregate statistics
    const totalStats = await prisma.blogPostStats.aggregate({
      _sum: {
        totalViews: true,
        uniqueViews: true,
        totalLikes: true,
        registeredViews: true,
        anonymousViews: true,
      },
      _avg: {
        avgViewDuration: true,
      }
    })

    // Get top performing posts (by views) - include posts with stats
    const topByViews = await prisma.blogPost.findMany({
      where: {
        published: true,
        stats: {
          isNot: null
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        stats: {
          select: {
            totalViews: true,
            totalLikes: true,
          }
        }
      },
      orderBy: {
        stats: {
          totalViews: 'desc'
        }
      },
      take: 5
    })

    // Filter out posts with 0 views
    const filteredTopByViews = topByViews.filter(post => post.stats && post.stats.totalViews > 0)

    // Get most liked posts - include posts with stats
    const topByLikes = await prisma.blogPost.findMany({
      where: {
        published: true,
        stats: {
          isNot: null
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        stats: {
          select: {
            totalViews: true,
            totalLikes: true,
          }
        }
      },
      orderBy: {
        stats: {
          totalLikes: 'desc'
        }
      },
      take: 5
    })

    // Filter out posts with 0 likes
    const filteredTopByLikes = topByLikes.filter(post => post.stats && post.stats.totalLikes > 0)

    // Get engagement metrics
    const engagementStats = await prisma.userEngagement.aggregate({
      _avg: {
        scrollDepth: true,
        timeOnPage: true,
        clicks: true,
        shares: true,
      },
      _sum: {
        clicks: true,
        shares: true,
        comments: true,
      },
      _count: {
        id: true,
      }
    })

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await prisma.blogPostView.groupBy({
      by: ['blogPostId'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get the blog post details for recent activity
    const recentActivityPosts = await prisma.blogPost.findMany({
      where: {
        id: {
          in: recentActivity.map(a => a.blogPostId)
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
      }
    })

    const recentActivityWithTitles = recentActivity.map(activity => {
      const post = recentActivityPosts.find(p => p.id === activity.blogPostId)
      return {
        ...activity,
        title: post?.title || 'Unknown',
        slug: post?.slug || ''
      }
    })

    return NextResponse.json({
      posts: blogPosts,
      totalStats,
      topByViews: filteredTopByViews,
      topByLikes: filteredTopByLikes,
      engagementStats,
      recentActivity: recentActivityWithTitles,
    })
  } catch (error) {
    console.error("Error fetching blog stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog statistics" },
      { status: 500 }
    )
  }
}
