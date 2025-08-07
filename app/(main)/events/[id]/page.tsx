import { notFound } from "next/navigation";
import { EventDetailsClient } from "./event-details-client";
import { prisma } from "@/lib/prisma-client";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params as required in Next.js 15
  const { id } = await params;

  // Fetch event with RSVP count in a single query
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: { rsvps: true }
      }
    }
  });

  // Check if event exists and is published
  if (!event || !event.published) {
    notFound();
  }

  return <EventDetailsClient event={event} />;
}
