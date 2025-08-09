"use server"

import { prisma } from '@/lib/prisma-client'
import { getCurrentUser } from '@/lib/auth-actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Generate a URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Get all published user blog posts
export async function getPublishedUserBlogPosts() {
  try {
    const posts = await prisma.userBlogPost.findMany({
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
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        likeCount: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
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
        publishedAt: 'desc'
      }
    })

    return posts
  } catch (error) {
    console.error('Error fetching published user blog posts:', error)
    return []
  }
}

// Get user's own blog posts
export async function getUserBlogPosts(userId: string) {
  try {
    const posts = await prisma.userBlogPost.findMany({
      where: {
        authorId: userId
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        likeCount: true,
        authorId: true,
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

    return posts
  } catch (error) {
    console.error('Error fetching user blog posts:', error)
    return []
  }
}

// Get a single blog post by slug
export async function getUserBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.userBlogPost.findUnique({
      where: {
        slug
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true
                  }
                }
              }
            }
          },
          where: {
            parentId: null
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (post && post.published) {
      // Increment view count
      await prisma.userBlogPost.update({
        where: { id: post.id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
    }

    return post
  } catch (error) {
    console.error('Error fetching user blog post:', error)
    return null
  }
}

// Create a new blog post
export async function createUserBlogPost(data: {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  tags?: string[]
  published?: boolean
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Generate unique slug
    let slug = generateSlug(data.title)
    let slugCounter = 0
    let uniqueSlug = slug

    while (await prisma.userBlogPost.findUnique({ where: { slug: uniqueSlug } })) {
      slugCounter++
      uniqueSlug = `${slug}-${slugCounter}`
    }

    const post = await prisma.userBlogPost.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        content: data.content,
        excerpt: data.excerpt || data.content.substring(0, 200).replace(/<[^>]*>/g, ''),
        coverImage: data.coverImage,
        tags: data.tags || [],
        published: data.published || false,
        publishedAt: data.published ? new Date() : null,
        authorId: user.id
      }
    })

    revalidatePath('/community-blogs')
    return { success: true, slug: post.slug }
  } catch (error) {
    console.error('Error creating user blog post:', error)
    return { success: false, error: 'Failed to create blog post' }
  }
}

// Update a blog post
export async function updateUserBlogPost(
  id: string,
  data: {
    title?: string
    content?: string
    excerpt?: string
    coverImage?: string
    tags?: string[]
    published?: boolean
  }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if the user owns this post
    const existingPost = await prisma.userBlogPost.findUnique({
      where: { id }
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      throw new Error('Unauthorized')
    }

    // If title changed, update slug
    let updateData: any = { ...data }
    if (data.title && data.title !== existingPost.title) {
      let slug = generateSlug(data.title)
      let slugCounter = 0
      let uniqueSlug = slug

      while (true) {
        const existing = await prisma.userBlogPost.findUnique({
          where: { slug: uniqueSlug }
        })
        if (!existing || existing.id === id) break
        slugCounter++
        uniqueSlug = `${slug}-${slugCounter}`
      }

      updateData.slug = uniqueSlug
    }

    // Update publishedAt if publishing for the first time
    if (data.published && !existingPost.published) {
      updateData.publishedAt = new Date()
    }

    const post = await prisma.userBlogPost.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/community-blogs')
    revalidatePath(`/community-blogs/${post.slug}`)
    return { success: true, slug: post.slug }
  } catch (error) {
    console.error('Error updating user blog post:', error)
    return { success: false, error: 'Failed to update blog post' }
  }
}

// Delete a blog post
export async function deleteUserBlogPost(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if the user owns this post
    const post = await prisma.userBlogPost.findUnique({
      where: { id }
    })

    if (!post || post.authorId !== user.id) {
      throw new Error('Unauthorized')
    }

    await prisma.userBlogPost.delete({
      where: { id }
    })

    revalidatePath('/community-blogs')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user blog post:', error)
    return { success: false, error: 'Failed to delete blog post' }
  }
}

// Toggle like on a blog post
export async function toggleUserBlogLike(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const existingLike = await prisma.userBlogLike.findUnique({
      where: {
        userBlogPostId_userId: {
          userBlogPostId: postId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.userBlogLike.delete({
        where: { id: existingLike.id }
      })

      await prisma.userBlogPost.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1
          }
        }
      })

      return { success: true, liked: false }
    } else {
      // Like
      await prisma.userBlogLike.create({
        data: {
          userBlogPostId: postId,
          userId: user.id
        }
      })

      await prisma.userBlogPost.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1
          }
        }
      })

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, error: 'Failed to toggle like' }
  }
}

// Add a comment to a blog post
export async function addUserBlogComment(
  postId: string,
  content: string,
  parentId?: string
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const comment = await prisma.userBlogComment.create({
      data: {
        content,
        userBlogPostId: postId,
        userId: user.id,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    // Note: postId is the post ID, not slug, so we can't revalidate the specific path
    revalidatePath('/community-blogs')
    return { success: true, comment }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

export async function getRelatedUserBlogPosts(currentPostId: string, tags: string[]) {
  try {
    // First try to get posts with matching tags
    const relatedByTags = await prisma.userBlogPost.findMany({
      where: {
        id: { not: currentPostId },
        published: true,
        tags: {
          hasSome: tags
        }
      },
      include: {
        author: true,
        likes: true,
        comments: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 6
    })

    // If we don't have enough, get more recent posts
    if (relatedByTags.length < 3) {
      const recentPosts = await prisma.userBlogPost.findMany({
        where: {
          id: { 
            not: currentPostId,
            notIn: relatedByTags.map(p => p.id)
          },
          published: true
        },
        include: {
          author: true,
          likes: true,
          comments: true
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: 3 - relatedByTags.length
      })
      
      return [...relatedByTags, ...recentPosts]
    }

    return relatedByTags
  } catch (error) {
    console.error("Error getting related posts:", error)
    return []
  }
}

// Get popular tags
export async function getPopularTags() {
  try {
    const posts = await prisma.userBlogPost.findMany({
      where: {
        published: true
      },
      select: {
        tags: true
      }
    })

    const tagCounts = new Map<string, number>()
    posts.forEach(post => {
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
    console.error('Error fetching popular tags:', error)
    return []
  }
}

// Search blog posts
export async function searchUserBlogPosts(query: string, tag?: string) {
  try {
    const where: any = {
      published: true
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (tag) {
      where.tags = { has: tag }
    }

    const posts = await prisma.userBlogPost.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        likeCount: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
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
        publishedAt: 'desc'
      }
    })

    return posts
  } catch (error) {
    console.error('Error searching user blog posts:', error)
    return []
  }
}

// Upload blog image
export async function uploadBlogImage(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Invalid file type. Please upload an image.' }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size too large. Maximum size is 5MB.' }
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary with balanced quality settings
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'community-blogs',
      resource_type: 'image',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' }, // Higher resolution for better quality
        { quality: 'auto:good' }, // Good quality maintains visual fidelity
        { fetch_format: 'auto' }, // Auto-select best format (WebP for modern browsers)
        { flags: 'progressive' }, // Progressive loading
        { dpr: 'auto' } // Auto-adjust for retina displays
      ]
    })

    if (!result || !result.secure_url) {
      return { success: false, error: 'Failed to upload image' }
    }

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Error uploading blog image:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}
