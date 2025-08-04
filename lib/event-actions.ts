
"use server"

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getEvents() {
  return await prisma.event.findMany({
    orderBy: {
      date: 'desc',
    },
  })
}

export async function getEventById(id: string) {
  return await prisma.event.findUnique({
    where: { id },
  })
}

export async function createEvent(data: any) {
  try {
    const event = await prisma.event.create({
      data,
    })
    revalidatePath('/admin/events')
    revalidatePath('/events')
    return { success: true, event }
  } catch (error) {
    return { success: false, error: 'Failed to create event' }
  }
}

export async function updateEvent(id: string, data: any) {
  try {
    const event = await prisma.event.update({
      where: { id },
      data,
    })
    revalidatePath('/admin/events')
    revalidatePath('/events')
    revalidatePath(`/admin/events/${id}/edit`)
    return { success: true, event }
  } catch (error) {
    return { success: false, error: 'Failed to update event' }
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({
      where: { id },
    })
    revalidatePath('/admin/events')
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete event' }
  }
}
