'use server'

import { prisma } from '@/lib/prisma-client'
import { getCurrentUser } from '@/lib/auth-actions'
import { CommentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Fetch comments for a blog post
export async function getComments(blogPostId: string) {
  try {
    const comments = await prisma.blogComment.findMany({
      where: {
        blogPostId,
        status: 'APPROVED',
        parentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        replies: {
          where: {
            status: 'APPROVED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            commentLikes: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        commentLikes: true
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return { success: true, comments }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { success: false, error: 'Failed to fetch comments' }
  }
}

// Create a new comment
export async function createComment(
  blogPostId: string,
  content: string,
  parentId?: string
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to comment' }
    }

    // Validate content
    if (!content || content.trim().length < 3) {
      return { success: false, error: 'Comment must be at least 3 characters long' }
    }

    if (content.length > 1000) {
      return { success: false, error: 'Comment must be less than 1000 characters' }
    }

    // Check if blog post exists
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId }
    })

    if (!blogPost) {
      return { success: false, error: 'Blog post not found' }
    }

    // Create comment
    const comment = await prisma.blogComment.create({
      data: {
        content: content.trim(),
        blogPostId,
        userId: user.id,
        parentId,
        status: 'APPROVED' // Auto-approve for now, can add moderation later
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Update engagement stats
    await prisma.userEngagement.updateMany({
      where: {
        blogPostId,
        userId: user.id
      },
      data: {
        comments: {
          increment: 1
        }
      }
    })

    revalidatePath(`/blog/${blogPost.slug}`)
    
    return { success: true, comment }
  } catch (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: 'Failed to create comment' }
  }
}

// Edit a comment
export async function editComment(commentId: string, content: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to edit comments' }
    }

    // Get the comment
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { blogPost: true }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'You can only edit your own comments' }
    }

    // Validate content
    if (!content || content.trim().length < 3) {
      return { success: false, error: 'Comment must be at least 3 characters long' }
    }

    if (content.length > 1000) {
      return { success: false, error: 'Comment must be less than 1000 characters' }
    }

    // Update comment
    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    revalidatePath(`/blog/${comment.blogPost.slug}`)
    
    return { success: true, comment: updatedComment }
  } catch (error) {
    console.error('Error editing comment:', error)
    return { success: false, error: 'Failed to edit comment' }
  }
}

// Delete a comment
export async function deleteComment(commentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to delete comments' }
    }

    // Get the comment
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { blogPost: true }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'You can only delete your own comments' }
    }

    // Delete comment (cascade will delete replies and likes)
    await prisma.blogComment.delete({
      where: { id: commentId }
    })

    revalidatePath(`/blog/${comment.blogPost.slug}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}

// Like/unlike a comment
export async function toggleCommentLike(commentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to like comments' }
    }

    // Check if comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { blogPost: true }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    // Check if user already liked the comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existingLike.id }
      })

      await prisma.blogComment.update({
        where: { id: commentId },
        data: {
          likes: {
            decrement: 1
          }
        }
      })

      revalidatePath(`/blog/${comment.blogPost.slug}`)
      return { success: true, liked: false }
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId: user.id
        }
      })

      await prisma.blogComment.update({
        where: { id: commentId },
        data: {
          likes: {
            increment: 1
          }
        }
      })

      revalidatePath(`/blog/${comment.blogPost.slug}`)
      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling comment like:', error)
    return { success: false, error: 'Failed to update like status' }
  }
}

// Report a comment
export async function reportComment(
  commentId: string,
  reason: string,
  description?: string
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to report comments' }
    }

    // Check if comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    // Check if user already reported this comment
    const existingReport = await prisma.commentReport.findFirst({
      where: {
        commentId,
        userId: user.id
      }
    })

    if (existingReport) {
      return { success: false, error: 'You have already reported this comment' }
    }

    // Create report
    await prisma.commentReport.create({
      data: {
        commentId,
        userId: user.id,
        reason,
        description
      }
    })

    // Flag comment if it has multiple reports
    const reportCount = await prisma.commentReport.count({
      where: { commentId }
    })

    if (reportCount >= 3) {
      await prisma.blogComment.update({
        where: { id: commentId },
        data: { status: 'FLAGGED' }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error reporting comment:', error)
    return { success: false, error: 'Failed to report comment' }
  }
}

// Pin/unpin a comment (Admin only)
export async function togglePinComment(commentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Only admins can pin comments' }
    }

    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { blogPost: true }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: {
        isPinned: !comment.isPinned
      }
    })

    revalidatePath(`/blog/${comment.blogPost.slug}`)
    
    return { success: true, isPinned: updatedComment.isPinned }
  } catch (error) {
    console.error('Error toggling pin status:', error)
    return { success: false, error: 'Failed to update pin status' }
  }
}

// Moderate a comment (Admin only)
export async function moderateComment(
  commentId: string,
  status: CommentStatus
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Only admins can moderate comments' }
    }

    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: { blogPost: true }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    await prisma.blogComment.update({
      where: { id: commentId },
      data: { status }
    })

    revalidatePath(`/blog/${comment.blogPost.slug}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error moderating comment:', error)
    return { success: false, error: 'Failed to moderate comment' }
  }
}

// Get comment stats for admin
export async function getCommentStats() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Only admins can view comment stats' }
    }

    const [total, pending, flagged, reports] = await Promise.all([
      prisma.blogComment.count(),
      prisma.blogComment.count({ where: { status: 'PENDING' } }),
      prisma.blogComment.count({ where: { status: 'FLAGGED' } }),
      prisma.commentReport.count({ where: { status: 'PENDING' } })
    ])

    return {
      success: true,
      stats: {
        total,
        pending,
        flagged,
        pendingReports: reports
      }
    }
  } catch (error) {
    console.error('Error fetching comment stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}
