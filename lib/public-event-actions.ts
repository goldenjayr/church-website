
"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getPublicEvents() {
  return await prisma.event.findMany({
    where: { published: true },
    orderBy: {
      date: "asc",
    },
  });
}

export async function getPublicEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });
  
  // Return null if event doesn't exist or is not published
  if (!event || !event.published) {
    return null;
  }
  
  return event;
}
