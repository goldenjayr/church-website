"use server"

import { prisma } from "@/lib/prisma-client"
import { ContentType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface CreateBlogPostData {
  title: string
  content: string
  excerpt?: string
  metaDescription?: string
  imageUrl?: string
  published: boolean
  featured: boolean
  tags: string[]
  categoryId?: string
  authorId: string
  authorName?: string
  memberId?: string
}

export interface UpdateBlogPostData extends CreateBlogPostData {
  id: string
}

export async function createBlogPost(data: CreateBlogPostData) {
  try {
    const slug = generateSlug(data.title)

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        contentType: ContentType.HTML,
      },
      include: {
        author: true,
        category: true,
      },
    })

    revalidatePath("/admin/blog")
    return { success: true, post }
  } catch (error) {
    console.error("Error creating blog post:", error)
    return { success: false, error: "Failed to create blog post" }
  }
}

export async function updateBlogPost(data: UpdateBlogPostData) {
  try {
    const slug = generateSlug(data.title)

    const post = await prisma.blogPost.update({
      where: { id: data.id },
      data: {
        ...data,
        slug,
        contentType: ContentType.HTML,
      },
      include: {
        author: true,
      },
    })

    revalidatePath("/admin/blog")
    revalidatePath(`/admin/blog/${data.id}`)
    return { success: true, post }
  } catch (error) {
    console.error("Error updating blog post:", error)
    return { success: false, error: "Failed to update blog post" }
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({
      where: { id },
    })

    revalidatePath("/admin/blog")
    return { success: true }
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return { success: false, error: "Failed to delete blog post" }
  }
}

export async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      include: {
        author: true,
        member: {
          include: {
            position: true
          }
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return posts
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

export async function getBlogPost(id: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
        member: {
          include: {
            position: true
          }
        },
        category: true,
      },
    })

    return post
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: true,
        member: {
          include: {
            position: true
          }
        },
        category: true,
      },
    })

    return post
  } catch (error) {
    console.error("Error fetching blog post by slug:", error)
    return null
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}