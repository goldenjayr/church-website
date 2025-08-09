import { notFound } from "next/navigation";
import { EventDetailsClient } from "./event-details-client";
import { prisma } from "@/lib/prisma-client";
import type { Metadata } from "next";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      author: true
    }
  });

  if (!event || !event.published) {
    return {
      title: "Event Not Found | Divine Jesus Church",
      description: "The event you're looking for doesn't exist or has been removed."
    };
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    title: `${event.title} | Divine Jesus Church Events`,
    description: event.description || `Join us for ${event.title} on ${eventDate} at ${event.time} - ${event.location}`,
    keywords: `Divine Jesus Church, event, ${event.title}, ${event.location}, church event, community`,
    authors: [{ name: event.author?.name || 'Divine Jesus Church' }],
    openGraph: {
      title: event.title,
      description: event.description || `Join us for this special event at Divine Jesus Church`,
      type: 'website',
      siteName: 'Divine Jesus Church',
      locale: 'en_US',
      ...(event.image && { 
        images: [{ 
          url: event.image, 
          alt: event.title,
          width: 1200,
          height: 630
        }] 
      })
    },
    twitter: {
      card: event.image ? 'summary_large_image' : 'summary',
      title: event.title,
      description: event.description || `Join us for ${event.title} on ${eventDate}`,
      ...(event.image && { images: [event.image] })
    },
    other: {
      'event:start_date': event.date.toISOString(),
      'event:location': event.location,
      'event:time': event.time
    }
  };
}

export default async function EventPage({ params }: EventPageProps) {
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
