"use server"

import { prisma } from "@/lib/prisma-client"
import { revalidatePath } from "next/cache"

export interface CreateMemberData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  bio?: string
  imageUrl?: string
  positionId?: string
  featured: boolean
  joinDate: Date
}

export interface UpdateMemberData extends CreateMemberData {
  id: string
}

export async function createMember(data: CreateMemberData) {
  try {
    const member = await prisma.member.create({
      data,
      include: {
        position: true,
        _count: {
          select: { authoredPosts: true }
        }
      }
    })

    revalidatePath("/admin/members")
    return { success: true, member }
  } catch (error) {
    console.error("Error creating member:", error)
    return { success: false, error: "Failed to create member" }
  }
}

export async function updateMember(data: UpdateMemberData) {
  try {
    const member = await prisma.member.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        imageUrl: data.imageUrl,
        positionId: data.positionId,
        featured: data.featured,
        joinDate: data.joinDate,
      },
      include: {
        position: true,
        _count: {
          select: { authoredPosts: true }
        }
      }
    })

    revalidatePath("/admin/members")
    revalidatePath(`/admin/members/${data.id}`)
    return { success: true, member }
  } catch (error) {
    console.error("Error updating member:", error)
    return { success: false, error: "Failed to update member" }
  }
}

export async function deleteMember(id: string) {
  try {
    // Check if member has authored any blog posts
    const postsCount = await prisma.blogPost.count({
      where: { memberId: id }
    })

    if (postsCount > 0) {
      return { success: false, error: `Cannot delete member. They have authored ${postsCount} blog post(s).` }
    }

    await prisma.member.delete({
      where: { id }
    })

    revalidatePath("/admin/members")
    return { success: true }
  } catch (error) {
    console.error("Error deleting member:", error)
    return { success: false, error: "Failed to delete member" }
  }
}

export async function getMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        position: true,
        _count: {
          select: { authoredPosts: true }
        }
      },
      orderBy: [
        { featured: "desc" },
        { firstName: "asc" },
        { lastName: "asc" }
      ]
    })

    return members
  } catch (error) {
    console.error("Error fetching members:", error)
    return []
  }
}

export async function getMember(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        position: true,
        authoredPosts: {
          where: { published: true },
          include: {
            category: true,
            author: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: { authoredPosts: true }
        }
      }
    })

    return member
  } catch (error) {
    console.error("Error fetching member:", error)
    return null
  }
}

export async function getActiveMembers() {
  try {
    const members = await prisma.member.findMany({
      where: { active: true },
      include: {
        position: true
      },
      orderBy: [
        { featured: "desc" },
        { firstName: "asc" },
        { lastName: "asc" }
      ]
    })

    return members
  } catch (error) {
    console.error("Error fetching active members:", error)
    return []
  }
}

export async function getFeaturedMembers() {
  try {
    const members = await prisma.member.findMany({
      where: { 
        active: true,
        featured: true 
      },
      include: {
        position: true
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" }
      ]
    })

    return members
  } catch (error) {
    console.error("Error fetching featured members:", error)
    return []
  }
}

export async function getMembersByPosition(positionId: string) {
  try {
    const members = await prisma.member.findMany({
      where: { 
        positionId,
        active: true 
      },
      include: {
        position: true
      },
      orderBy: [
        { featured: "desc" },
        { firstName: "asc" },
        { lastName: "asc" }
      ]
    })

    return members
  } catch (error) {
    console.error("Error fetching members by position:", error)
    return []
  }
}

export async function toggleMemberStatus(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id },
      select: { active: true }
    })

    if (!member) {
      return { success: false, error: "Member not found" }
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: { active: !member.active },
      include: {
        position: true,
        _count: {
          select: { authoredPosts: true }
        }
      }
    })

    revalidatePath("/admin/members")
    return { success: true, member: updatedMember }
  } catch (error) {
    console.error("Error toggling member status:", error)
    return { success: false, error: "Failed to update member status" }
  }
}