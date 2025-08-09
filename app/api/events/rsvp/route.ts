import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { z } from "zod"
import { RedisService, CacheKeys, RateLimits } from '@/lib/services/redis.service'

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

    // Rate limiting check
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    
    const rateLimit = await RedisService.checkRateLimit(
      ipAddress,
      'rsvp',
      RateLimits.rsvp.max,
      RateLimits.rsvp.window
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Too many RSVP attempts. Please try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
          retryAfter: rateLimit.resetIn 
        },
        { status: 429 }
      )
    }

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

    // Check Redis for duplicate RSVP (faster than DB)
    const rsvpCacheKey = CacheKeys.eventRsvpCheck(eventId, email)
    const alreadyRsvpd = await RedisService.exists(rsvpCacheKey)
    
    if (alreadyRsvpd) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 400 }
      )
    }

    // Double-check in database
    const existingRsvp = await prisma.eventRSVP.findUnique({
      where: {
        eventId_email: {
          eventId,
          email
        }
      }
    })

    if (existingRsvp) {
      // Update Redis cache
      await RedisService.set(rsvpCacheKey, '1', 86400) // 24 hours
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

    // Mark in Redis that this email has RSVP'd
    await RedisService.set(rsvpCacheKey, '1', 86400) // 24 hours

    // Invalidate event cache to update RSVP count
    await RedisService.delete([
      CacheKeys.event(eventId),
      CacheKeys.eventList(),
      CacheKeys.eventRsvps(eventId)
    ])

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
