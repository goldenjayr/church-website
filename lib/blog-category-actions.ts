"use server"

import { prisma } from "@/lib/prisma-client"
import { revalidatePath } from "next/cache"

export interface CreateBlogCategoryData {
  name: string
  slug: string
  description?: string
  color?: string
  order?: number
}

export interface UpdateBlogCategoryData extends CreateBlogCategoryData {
  id: string
  active?: boolean
}

export async function createBlogCategory(data: CreateBlogCategoryData) {
  try {
    const category = await prisma.blogCategory.create({
      data: {
        ...data,
        order: data.order ?? 0,
      },
    })

    revalidatePath("/admin/blog")
    revalidatePath("/admin/blog/categories")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating blog category:", error)
    return { success: false, error: "Failed to create blog category" }
  }
}

export async function updateBlogCategory(data: UpdateBlogCategoryData) {
  try {
    const category = await prisma.blogCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        order: data.order,
        active: data.active,
      },
    })

    revalidatePath("/admin/blog")
    revalidatePath("/admin/blog/categories")
    revalidatePath(`/admin/blog/categories/${data.id}`)
    return { success: true, category }
  } catch (error) {
    console.error("Error updating blog category:", error)
    return { success: false, error: "Failed to update blog category" }
  }
}

export async function deleteBlogCategory(id: string) {
  try {
    // First, check if any blog posts use this category
    const postsUsingCategory = await prisma.blogPost.count({
      where: { categoryId: id },
    })

    if (postsUsingCategory > 0) {
      return { 
        success: false, 
        error: `Cannot delete category. ${postsUsingCategory} blog post(s) are using this category.` 
      }
    }

    await prisma.blogCategory.delete({
      where: { id },
    })

    revalidatePath("/admin/blog")
    revalidatePath("/admin/blog/categories")
    return { success: true }
  } catch (error) {
    console.error("Error deleting blog category:", error)
    return { success: false, error: "Failed to delete blog category" }
  }
}

export async function getBlogCategories() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: [
        { order: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            blogPosts: true,
          },
        },
      },
    })

    return categories
  } catch (error) {
    console.error("Error fetching blog categories:", error)
    return []
  }
}

export async function getBlogCategory(id: string) {
  try {
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogPosts: true,
          },
        },
      },
    })

    return category
  } catch (error) {
    console.error("Error fetching blog category:", error)
    return null
  }
}

export async function updateBlogCategoryOrders(categoryIds: string[]) {
  try {
    const updatePromises = categoryIds.map((id, index) =>
      prisma.blogCategory.update({
        where: { id },
        data: { order: index },
      })
    )

    await Promise.all(updatePromises)
    revalidatePath("/admin/blog/categories")
    return { success: true }
  } catch (error) {
    console.error("Error updating blog category orders:", error)
    return { success: false, error: "Failed to update blog category orders" }
  }
}