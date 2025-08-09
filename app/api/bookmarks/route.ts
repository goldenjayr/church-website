import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { prisma } from "@/lib/prisma-client"

// GET /api/bookmarks - Get user's bookmarked posts
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "all" // all, church, community
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    let bookmarks = []

    if (type === "church" || type === "all") {
      // Get church blog bookmarks
      const churchBookmarks = await prisma.blogBookmark.findMany({
        where: { userId: user.id },
        include: {
          blogPost: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
              category: true,
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        ...(type === "church" && { take: limit, skip }),
      })

      bookmarks = bookmarks.concat(
        churchBookmarks.map((b) => {
          // Determine the correct author name for church posts
          let authorName = "Anonymous"
          let authorImage = null
          
          if (b.blogPost.member) {
            // If member is set, use member's name
            authorName = `${b.blogPost.member.firstName} ${b.blogPost.member.lastName}`.trim()
            authorImage = b.blogPost.member.imageUrl
          } else if (b.blogPost.authorName) {
            // Otherwise use authorName field if set
            authorName = b.blogPost.authorName
          } else if (b.blogPost.author) {
            // Fall back to admin user name
            authorName = b.blogPost.author.name || "Admin"
            authorImage = b.blogPost.author.profileImage
          }
          
          return {
            ...b.blogPost,
            postType: "church",
            bookmarkedAt: b.createdAt,
            slug: b.blogPost.slug, // Ensure slug is included
            // Override author with the correct author info
            author: {
              id: b.blogPost.author?.id || "",
              name: authorName,
              profileImage: authorImage,
            },
          }
        })
      )
    }

    if (type === "community" || type === "all") {
      // Get community blog bookmarks
      const communityBookmarks = await prisma.userBlogBookmark.findMany({
        where: { userId: user.id },
        include: {
          userBlogPost: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        ...(type === "community" && { take: limit, skip }),
      })

      bookmarks = bookmarks.concat(
        communityBookmarks.map((b) => ({
          ...b.userBlogPost,
          postType: "community",
          bookmarkedAt: b.createdAt,
          slug: b.userBlogPost.slug, // Ensure slug is included
        }))
      )
    }

    // If fetching all, sort by bookmark date and apply pagination
    if (type === "all") {
      bookmarks.sort((a, b) => 
        new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
      )
      bookmarks = bookmarks.slice(skip, skip + limit)
    }

    return NextResponse.json({
      bookmarks,
      pagination: {
        page,
        limit,
        total: bookmarks.length,
      },
    })
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    )
  }
}

// POST /api/bookmarks - Toggle bookmark for a post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { postId, postType } = body

    if (!postId || !postType) {
      return NextResponse.json(
        { error: "Missing postId or postType" },
        { status: 400 }
      )
    }

    let isBookmarked = false
    let bookmark = null

    if (postType === "church") {
      // Check if already bookmarked
      const existing = await prisma.blogBookmark.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: postId,
            userId: user.id,
          },
        },
      })

      if (existing) {
        // Remove bookmark
        await prisma.blogBookmark.delete({
          where: { id: existing.id },
        })
        isBookmarked = false
      } else {
        // Add bookmark
        bookmark = await prisma.blogBookmark.create({
          data: {
            blogPostId: postId,
            userId: user.id,
          },
        })
        isBookmarked = true
      }
    } else if (postType === "community") {
      // Check if already bookmarked
      const existing = await prisma.userBlogBookmark.findUnique({
        where: {
          userBlogPostId_userId: {
            userBlogPostId: postId,
            userId: user.id,
          },
        },
      })

      if (existing) {
        // Remove bookmark
        await prisma.userBlogBookmark.delete({
          where: { id: existing.id },
        })
        isBookmarked = false
      } else {
        // Add bookmark
        bookmark = await prisma.userBlogBookmark.create({
          data: {
            userBlogPostId: postId,
            userId: user.id,
          },
        })
        isBookmarked = true
      }
    } else {
      return NextResponse.json(
        { error: "Invalid postType" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      isBookmarked,
      bookmark,
    })
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    )
  }
}

// DELETE /api/bookmarks - Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get("postId")
    const postType = searchParams.get("postType")

    if (!postId || !postType) {
      return NextResponse.json(
        { error: "Missing postId or postType" },
        { status: 400 }
      )
    }

    if (postType === "church") {
      await prisma.blogBookmark.deleteMany({
        where: {
          blogPostId: postId,
          userId: user.id,
        },
      })
    } else if (postType === "community") {
      await prisma.userBlogBookmark.deleteMany({
        where: {
          userBlogPostId: postId,
          userId: user.id,
        },
      })
    } else {
      return NextResponse.json(
        { error: "Invalid postType" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing bookmark:", error)
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    )
  }
}
