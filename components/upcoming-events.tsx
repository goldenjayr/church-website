import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { getPublicEvents } from "@/lib/public-event-actions"
import { MotionDiv } from "./motion-div"

export async function UpcomingEvents() {
  const allEvents = await getPublicEvents()
  const upcomingEvents = allEvents
    .filter(event => new Date(event.date) >= new Date())
    .slice(0, 3)

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-6">Upcoming Events</h2>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join us for these exciting opportunities to connect, grow, and serve together as a community.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event, index) => (
            <MotionDiv
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white dark:bg-gray-800">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg px-3 py-1">
                    <div className="flex items-center space-x-1 text-sm font-semibold text-slate-800 dark:text-white">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 flex-grow">{event.title}</h3>

                  <div className="space-y-2 mb-4 text-slate-600 dark:text-gray-300 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    {event.maxAttendees && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.maxAttendees} spots</span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-6 text-sm line-clamp-3 flex-grow">{event.description}</p>

                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-auto">
                    <Link href={`/events/${event.id}`}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent dark:text-white dark:border-white dark:hover:bg-white/10">
            <Link href="/events">View All Events</Link>
          </Button>
        </MotionDiv>
      </div>
    </section>
  )
}