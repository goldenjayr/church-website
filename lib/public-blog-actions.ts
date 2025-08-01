"use server"

import { prisma } from "@/lib/prisma-client"
import { BlogCategory } from "@prisma/client"

export async function getPublishedBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
      },
      include: {
        author: true,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    })

    return posts
  } catch (error) {
    console.error("Error fetching published blog posts:", error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        published: true,
      },
      include: {
        author: true,
      },
    })

    return post
  } catch (error) {
    console.error("Error fetching blog post by slug:", error)
    return null
  }
}

export async function getRelatedBlogPosts(postId: string, category: BlogCategory, limit: number = 3) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        category,
        id: { not: postId },
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return posts
  } catch (error) {
    console.error("Error fetching related blog posts:", error)
    return []
  }
}

export async function getFeaturedBlogPosts(limit: number = 3) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        featured: true,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return posts
  } catch (error) {
    console.error("Error fetching featured blog posts:", error)
    return []
  }
}