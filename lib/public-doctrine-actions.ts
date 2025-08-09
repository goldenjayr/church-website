"use server"

import { prisma } from "@/lib/prisma-client"

export async function getPublishedDoctrines() {
  try {
    const doctrines = await prisma.doctrine.findMany({
      where: {
        published: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    return doctrines
  } catch (error) {
    console.error("Error fetching published doctrines:", error)
    return []
  }
}

export async function getDoctrinesByCategory(category: string) {
  try {
    const doctrines = await prisma.doctrine.findMany({
      where: {
        published: true,
        category,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    return doctrines
  } catch (error) {
    console.error("Error fetching doctrines by category:", error)
    return []
  }
}

export async function getDoctrineCategories() {
  try {
    const categories = await prisma.doctrine.groupBy({
      by: ['category'],
      where: {
        published: true,
      },
      orderBy: {
        category: 'asc',
      },
    })

    return categories.map(item => item.category)
  } catch (error) {
    console.error("Error fetching doctrine categories:", error)
    return []
  }
}
