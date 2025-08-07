import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
        location: true,
        maxAttendees: true,
        description: true,
        published: true,
        _count: {
          select: { rsvps: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to fetch event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}
