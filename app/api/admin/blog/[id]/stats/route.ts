import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get blog post with all related data
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        },
        category: true,
        stats: true,
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        views: {
          select: {
            id: true,
            userId: true,
            sessionId: true,
            ipAddress: true,
            userAgent: true,
            referrer: true,
            country: true,
            city: true,
            viewDuration: true,
            isBot: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        engagements: {
          select: {
            id: true,
            userId: true,
            sessionId: true,
            scrollDepth: true,
            timeOnPage: true,
            clicks: true,
            shares: true,
            comments: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }
      }
    })

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    // Calculate view analytics
    const viewAnalytics = {
      totalViews: blogPost.views.length,
      uniqueViews: new Set(blogPost.views.map(v => v.sessionId)).size,
      registeredViews: blogPost.views.filter(v => v.userId).length,
      anonymousViews: blogPost.views.filter(v => !v.userId).length,
      botViews: blogPost.views.filter(v => v.isBot).length,
      humanViews: blogPost.views.filter(v => !v.isBot).length,
    }

    // Calculate average metrics
    const validDurations = blogPost.views
      .filter(v => v.viewDuration && v.viewDuration > 0)
      .map(v => v.viewDuration as number)

    const avgViewDuration = validDurations.length > 0
      ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length
      : 0

    // Group views by date for chart
    const viewsByDate = blogPost.views.reduce((acc, view) => {
      const date = new Date(view.createdAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group views by country
    const viewsByCountry = blogPost.views
      .filter(v => v.country)
      .reduce((acc, view) => {
        const country = view.country || 'Unknown'
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Group views by referrer
    const viewsByReferrer = blogPost.views
      .filter(v => v.referrer)
      .reduce((acc, view) => {
        let referrer = view.referrer || 'Direct'
        try {
          const url = new URL(referrer)
          referrer = url.hostname
        } catch {}
        acc[referrer] = (acc[referrer] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Calculate engagement metrics
    const engagementMetrics = {
      totalEngagements: blogPost.engagements.length,
      avgScrollDepth: blogPost.engagements
        .filter(e => e.scrollDepth)
        .reduce((sum, e) => sum + (e.scrollDepth || 0), 0) /
        (blogPost.engagements.filter(e => e.scrollDepth).length || 1),
      avgTimeOnPage: blogPost.engagements
        .filter(e => e.timeOnPage)
        .reduce((sum, e) => sum + (e.timeOnPage || 0), 0) /
        (blogPost.engagements.filter(e => e.timeOnPage).length || 1),
      totalClicks: blogPost.engagements.reduce((sum, e) => sum + (e.clicks || 0), 0),
      totalShares: blogPost.engagements.reduce((sum, e) => sum + (e.shares || 0), 0),
      totalComments: blogPost.engagements.reduce((sum, e) => sum + (e.comments || 0), 0),
    }

    // Get hourly distribution of views (for last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentViews = blogPost.views.filter(v => new Date(v.createdAt) >= sevenDaysAgo)
    const hourlyDistribution = Array(24).fill(0)
    recentViews.forEach(view => {
      const hour = new Date(view.createdAt).getHours()
      hourlyDistribution[hour]++
    })

    // Get list of users who liked the post
    const likers = blogPost.likes.map(like => ({
      id: like.user.id,
      name: like.user.name || 'Anonymous',
      email: like.user.email,
      likedAt: like.createdAt,
    }))

    // Prepare response
    const response = {
      post: {
        id: blogPost.id,
        title: blogPost.title,
        slug: blogPost.slug,
        published: blogPost.published,
        featured: blogPost.featured,
        createdAt: blogPost.createdAt,
        updatedAt: blogPost.updatedAt,
        author: blogPost.author,
        category: blogPost.category,
        tags: blogPost.tags,
      },
      stats: {
        ...blogPost.stats,
        viewAnalytics,
        avgViewDuration,
        engagementMetrics,
      },
      likers,
      charts: {
        viewsByDate,
        viewsByCountry,
        viewsByReferrer,
        hourlyDistribution,
      },
      recentViews: blogPost.views.slice(0, 50), // Last 50 views
      recentEngagements: blogPost.engagements.slice(0, 20), // Last 20 engagements
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching blog post stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post statistics" },
      { status: 500 }
    )
  }
}
