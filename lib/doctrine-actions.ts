"use server"

import { prisma } from "@/lib/prisma-client"
import { ContentType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export interface CreateDoctrineData {
  title: string
  content: string
  category: string
  order?: number
  published: boolean
}

export interface UpdateDoctrineData extends CreateDoctrineData {
  id: string
}

export async function createDoctrine(data: CreateDoctrineData) {
  try {
    const doctrine = await prisma.doctrine.create({
      data: {
        ...data,
        contentType: ContentType.HTML,
        order: data.order ?? 0,
      },
    })

    revalidatePath("/admin/doctrines")
    return { success: true, doctrine }
  } catch (error) {
    console.error("Error creating doctrine:", error)
    return { success: false, error: "Failed to create doctrine" }
  }
}

export async function updateDoctrine(data: UpdateDoctrineData) {
  try {
    const doctrine = await prisma.doctrine.update({
      where: { id: data.id },
      data: {
        ...data,
        contentType: ContentType.HTML,
      },
    })

    revalidatePath("/admin/doctrines")
    revalidatePath(`/admin/doctrines/${data.id}`)
    return { success: true, doctrine }
  } catch (error) {
    console.error("Error updating doctrine:", error)
    return { success: false, error: "Failed to update doctrine" }
  }
}

export async function deleteDoctrine(id: string) {
  try {
    await prisma.doctrine.delete({
      where: { id },
    })

    revalidatePath("/admin/doctrines")
    return { success: true }
  } catch (error) {
    console.error("Error deleting doctrine:", error)
    return { success: false, error: "Failed to delete doctrine" }
  }
}

export async function getDoctrines() {
  try {
    const doctrines = await prisma.doctrine.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    return doctrines
  } catch (error) {
    console.error("Error fetching doctrines:", error)
    return []
  }
}

export async function getDoctrine(id: string) {
  try {
    const doctrine = await prisma.doctrine.findUnique({
      where: { id },
    })

    return doctrine
  } catch (error) {
    console.error("Error fetching doctrine:", error)
    return null
  }
}