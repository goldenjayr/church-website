"use server"

import { prisma } from "@/lib/prisma-client"
import { User, Role } from "@prisma/client"
import * as bcrypt from "bcryptjs"

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            blogPosts: true,
            events: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            blogPosts: true,
            events: true,
          }
        }
      }
    })
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function updateUserRole(userId: string, role: Role) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

export async function deleteUser(userId: string) {
  try {
    // Check if user has content
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            blogPosts: true,
            events: true,
          }
        }
      }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    if (user._count.blogPosts > 0 || user._count.events > 0) {
      return { 
        success: false, 
        error: "Cannot delete user with existing content. Please reassign or delete their posts and events first." 
      }
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return { success: true, user }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Failed to reset password" }
  }
}

export async function getUserStats() {
  try {
    const [totalUsers, adminCount, userCount, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    return {
      totalUsers,
      adminCount,
      userCount,
      recentUsers,
      growth: recentUsers.length
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      totalUsers: 0,
      adminCount: 0,
      userCount: 0,
      recentUsers: [],
      growth: 0
    }
  }
}
