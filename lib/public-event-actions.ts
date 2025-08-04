
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
  return await prisma.event.findUnique({
    where: { id, published: true },
  });
}
