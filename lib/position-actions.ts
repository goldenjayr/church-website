"use server"

import { prisma } from "@/lib/prisma-client"
import { revalidatePath } from "next/cache"

export interface CreatePositionData {
  name: string
  description?: string
  color: string
  order: number
}

export interface UpdatePositionData extends CreatePositionData {
  id: string
}

export async function createPosition(data: CreatePositionData) {
  try {
    const position = await prisma.position.create({
      data,
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    revalidatePath("/admin/positions")
    return { success: true, position }
  } catch (error) {
    console.error("Error creating position:", error)
    return { success: false, error: "Failed to create position" }
  }
}

export async function updatePosition(data: UpdatePositionData) {
  try {
    const position = await prisma.position.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        order: data.order,
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    revalidatePath("/admin/positions")
    revalidatePath(`/admin/positions/${data.id}`)
    return { success: true, position }
  } catch (error) {
    console.error("Error updating position:", error)
    return { success: false, error: "Failed to update position" }
  }
}

export async function deletePosition(id: string) {
  try {
    // First check if any members are assigned to this position
    const membersCount = await prisma.member.count({
      where: { positionId: id }
    })

    if (membersCount > 0) {
      return { success: false, error: `Cannot delete position. ${membersCount} member(s) are assigned to this position.` }
    }

    await prisma.position.delete({
      where: { id }
    })

    revalidatePath("/admin/positions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting position:", error)
    return { success: false, error: "Failed to delete position" }
  }
}

export async function getPositions() {
  try {
    const positions = await prisma.position.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: [
        { order: "asc" },
        { name: "asc" }
      ]
    })

    return positions
  } catch (error) {
    console.error("Error fetching positions:", error)
    return []
  }
}

export async function getPosition(id: string) {
  try {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        members: {
          where: { active: true },
          orderBy: [
            { firstName: "asc" },
            { lastName: "asc" }
          ]
        },
        _count: {
          select: { members: true }
        }
      }
    })

    return position
  } catch (error) {
    console.error("Error fetching position:", error)
    return null
  }
}

export async function updatePositionOrders(positionIds: string[]) {
  try {
    const updatePromises = positionIds.map((id, index) =>
      prisma.position.update({
        where: { id },
        data: { order: index }
      })
    )

    await Promise.all(updatePromises)
    revalidatePath("/admin/positions")
    return { success: true }
  } catch (error) {
    console.error("Error updating position orders:", error)
    return { success: false, error: "Failed to update position order" }
  }
}

export async function getActivePositions() {
  try {
    const positions = await prisma.position.findMany({
      where: { active: true },
      orderBy: [
        { order: "asc" },
        { name: "asc" }
      ]
    })

    return positions
  } catch (error) {
    console.error("Error fetching active positions:", error)
    return []
  }
}