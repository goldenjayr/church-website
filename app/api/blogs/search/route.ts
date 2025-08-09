import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") || "all" // all, my, church, community

    const skip = (page - 1) * limit

    // Get current user for "my" posts filter
    const currentUser = await getCurrentUser()

    // Prepare queries for both church and community blogs
    let churchPosts: any[] = []
    let communityPosts: any[] = []
    let churchCount = 0
    let communityCount = 0

    // Build where clauses for each type
    const buildSearchConditions = (searchQuery: string) => ({
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" as const } },
        { excerpt: { contains: searchQuery, mode: "insensitive" as const } },
        { content: { contains: searchQuery, mode: "insensitive" as const } },
      ]
    })

    const buildTagConditions = (tagList: string[]) => ({
      OR: tagList.map(tag => ({
        tags: { has: tag }
      }))
    })

    // Query church blogs if needed
    if (type === "all" || type === "church") {
      const churchWhere: any = { published: true }

      if (query) {
        churchWhere.AND = [buildSearchConditions(query)]
      }

      if (tags.length > 0) {
        const tagCond = buildTagConditions(tags)
        if (churchWhere.AND) {
          churchWhere.AND.push(tagCond)
        } else {
          churchWhere.AND = [tagCond]
        }
      }

      const [churchResults, churchTotal] = await Promise.all([
        prisma.blogPost.findMany({
          where: churchWhere,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              }
            },
            member: {
              include: {
                position: true
              }
            },
            category: true,
            stats: true, // Include stats for viewCount
            _count: {
              select: {
                views: true,
                likes: true,
                comments: true,
              }
            }
          },
          orderBy: [
            { featured: "desc" },
            { createdAt: "desc" }
          ],
          skip: type === "church" ? skip : 0,
          take: type === "church" ? limit : 1000, // Get all for mixing
        }),
        prisma.blogPost.count({ where: churchWhere })
      ])

      churchPosts = churchResults.map(post => ({
        ...post,
        postType: "church",
        publishedAt: post.createdAt, // BlogPost doesn't have publishedAt
        viewCount: post.stats?.totalViews || post._count?.views || 0, // Get viewCount from stats or count
        // Transform author to use member name if available
        author: {
          ...post.author,
          name: post.member ? `${post.member.firstName} ${post.member.lastName}` : (post.authorName || post.author?.name || 'Church Admin'),
          profileImage: post.member?.imageUrl || post.author?.profileImage
        }
      }))
      churchCount = churchTotal
    }

    // Query community blogs (CommunityBlogPost) if needed
    if (type === "all" || type === "community" || type === "my") {
      const communityWhere: any = type === "my" && currentUser
        ? { authorId: currentUser.id }
        : {
            OR: [
              { published: true },
              ...(currentUser ? [{ authorId: currentUser.id }] : [])
            ]
          }

      if (query) {
        const searchCond = buildSearchConditions(query)
        if (communityWhere.AND) {
          communityWhere.AND.push(searchCond)
        } else {
          communityWhere.AND = [searchCond]
        }
      }

      if (tags.length > 0) {
        const tagCond = buildTagConditions(tags)
        if (communityWhere.AND) {
          communityWhere.AND.push(tagCond)
        } else {
          communityWhere.AND = [tagCond]
        }
      }

      // Check if CommunityBlogPost table exists, otherwise use UserBlogPost
      let communityResults: any[] = []
      let communityTotal = 0

      try {
        // Try CommunityBlogPost first
        const [results, total] = await Promise.all([
          prisma.communityBlogPost.findMany({
            where: communityWhere,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                }
              }
            },
            orderBy: [
              { publishedAt: "desc" },
              { createdAt: "desc" }
            ],
            skip: type === "community" || type === "my" ? skip : 0,
            take: type === "community" || type === "my" ? limit : 1000,
          }),
          prisma.communityBlogPost.count({ where: communityWhere })
        ])
        communityResults = results
        communityTotal = total
      } catch (error) {
        // Fallback to UserBlogPost
        const [results, total] = await Promise.all([
          prisma.userBlogPost.findMany({
            where: communityWhere,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                }
              }
            },
            orderBy: [
              { publishedAt: "desc" },
              { createdAt: "desc" }
            ],
            skip: type === "community" || type === "my" ? skip : 0,
            take: type === "community" || type === "my" ? limit : 1000,
          }),
          prisma.userBlogPost.count({ where: communityWhere })
        ])
        communityResults = results
        communityTotal = total
      }

      communityPosts = communityResults.map(post => ({
        ...post,
        postType: "community",
        imageUrl: post.coverImage, // Map coverImage to imageUrl for consistency
        category: null // Community posts don't have categories
      }))
      communityCount = communityTotal
    }

    // Combine and paginate results for "all" type
    let finalPosts: any[] = []
    let totalCount = 0

    if (type === "all") {
      // Combine both types
      const allPosts = [...churchPosts, ...communityPosts]

      // Sort by date
      allPosts.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt).getTime()
        const dateB = new Date(b.publishedAt || b.createdAt).getTime()
        return dateB - dateA
      })

      // Apply pagination
      finalPosts = allPosts.slice(skip, skip + limit)
      totalCount = churchCount + communityCount
    } else if (type === "church") {
      finalPosts = churchPosts
      totalCount = churchCount
    } else {
      finalPosts = communityPosts
      totalCount = communityCount
    }

    // Get bookmarked post IDs for the current user
    let bookmarkedPostIds: Set<string> = new Set()
    if (currentUser) {
      try {
        // Get church blog bookmarks
        const churchBookmarks = await prisma.blogBookmark.findMany({
          where: { userId: currentUser.id },
          select: { blogPostId: true }
        })

        // Get community/user blog bookmarks
        const userBookmarks = await prisma.userBlogBookmark.findMany({
          where: { userId: currentUser.id },
          select: { userBlogPostId: true }
        })

        console.log(`Found ${churchBookmarks.length} church bookmarks and ${userBookmarks.length} user bookmarks for user ${currentUser.id}`)

        // Add church blog bookmarks
        churchBookmarks.forEach(bookmark => {
          bookmarkedPostIds.add(bookmark.blogPostId)
          console.log('Added church blog bookmark:', bookmark.blogPostId)
        })

        // Add user/community blog bookmarks
        userBookmarks.forEach(bookmark => {
          bookmarkedPostIds.add(bookmark.userBlogPostId)
          console.log('Added user blog bookmark:', bookmark.userBlogPostId)
        })

      } catch (error) {
        console.error("Error fetching bookmarks:", error)
      }
    }

    // Add isBookmarked flag to each post
    const postsWithBookmarks = finalPosts.map(post => ({
      ...post,
      isBookmarked: bookmarkedPostIds.has(post.id)
    }))

    const hasMore = skip + finalPosts.length < totalCount

    return NextResponse.json({
      posts: postsWithBookmarks,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore
      },
      bookmarkedIds: Array.from(bookmarkedPostIds) // Also send the list of bookmarked IDs
    })
  } catch (error) {
    console.error("Error searching blogs:", error)
    return NextResponse.json(
      { error: "Failed to search blogs" },
      { status: 500 }
    )
  }
}
