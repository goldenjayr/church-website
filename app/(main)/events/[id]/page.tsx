import { getPublicEventById } from "@/lib/public-event-actions";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Heart, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotionDiv } from "@/components/motion-div";
import { Badge } from "@/components/ui/badge";

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getPublicEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
        <MotionDiv
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={event.image || "/placeholder.jpg"}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            className="brightness-50"
          />
        </MotionDiv>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-0 left-0 p-4 md:p-8 z-10">
          <Link href="/events">
            <Button variant="outline" className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 p-8 md:p-12 z-10">
          <MotionDiv initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}>
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white">Community Event</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight shadow-lg">{event.title}</h1>
          </MotionDiv>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">About this Event</h2>
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 prose-a:text-primary prose-strong:text-gray-700 dark:prose-strong:text-gray-200"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </CardContent>
                <div className="px-6 pb-6 md:px-8 md:pb-8 flex items-center space-x-4 border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                  <Button variant="outline">
                    <Heart className="mr-2 h-4 w-4" /> Like
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-8">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Event Details</h3>
                  <ul className="space-y-5 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Calendar className="mr-4 h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Date</p>
                        <p>{new Date(event.date).toLocaleDateString("en-US", {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Clock className="mr-4 h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Time</p>
                        <p>{event.time}</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="mr-4 h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">Location</p>
                        <p>{event.location}</p>
                      </div>
                    </li>
                    {event.maxAttendees && (
                      <li className="flex items-start">
                        <Users className="mr-4 h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">Attendance</p>
                          <p>{event.maxAttendees} spots available</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden text-white church-gradient">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
                  <p className="mb-6 opacity-90">RSVP to secure your spot and receive event updates.</p>
                  <Button size="lg" className="w-full bg-[hsl(var(--church-accent))] text-white hover:bg-[hsl(var(--church-accent))]/90 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <Ticket className="mr-2 h-5 w-5" />
                    RSVP Now
                  </Button>
                </CardContent>
              </Card>
            </MotionDiv>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}