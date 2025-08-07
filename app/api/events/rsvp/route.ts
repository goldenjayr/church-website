import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { z } from "zod"

const rsvpSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = rsvpSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { eventId, name, email, phone, message } = validationResult.data

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
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

    if (!event.published) {
      return NextResponse.json(
        { error: "This event is not available for registration" },
        { status: 400 }
      )
    }

    // Check if event is full
    if (event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
      return NextResponse.json(
        { error: "Sorry, this event is fully booked" },
        { status: 400 }
      )
    }

    // Check if user already RSVP'd
    const existingRsvp = await prisma.eventRSVP.findUnique({
      where: {
        eventId_email: {
          eventId,
          email
        }
      }
    })

    if (existingRsvp) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 400 }
      )
    }

    // Create RSVP
    const rsvp = await prisma.eventRSVP.create({
      data: {
        eventId,
        name,
        email,
        phone: phone || null,
        message: message || null,
      }
    })

    // TODO: Send confirmation email to the user
    // You can integrate with your email service here (e.g., SendGrid, Resend, etc.)

    return NextResponse.json({
      success: true,
      message: "RSVP confirmed successfully",
      rsvp: {
        id: rsvp.id,
        name: rsvp.name,
        email: rsvp.email
      }
    })
  } catch (error) {
    console.error("RSVP error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your RSVP" },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch RSVPs for an event (optional, for admin use)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      )
    }

    const rsvps = await prisma.eventRSVP.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        createdAt: true
      }
    })

    const totalCount = await prisma.eventRSVP.count({
      where: { eventId }
    })

    return NextResponse.json({
      rsvps,
      totalCount
    })
  } catch (error) {
    console.error("Fetch RSVPs error:", error)
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    )
  }
}
