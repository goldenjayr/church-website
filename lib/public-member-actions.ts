'use server'

import { prisma } from '@/lib/prisma-client'

export async function getLeadershipTeam() {
  try {
    const leadership = await prisma.member.findMany({
      where: {
        active: true,
        positionId: {
          not: null,
        },
      },
      include: {
        position: true,
      },
      orderBy: {
        position: {
          order: 'asc',
        },
      },
    })
    return leadership
  } catch (error) {
    console.error("Error fetching leadership team:", error)
    return []
  }
}
