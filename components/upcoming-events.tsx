"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

// Mock data - this would come from your database
const upcomingEvents = [
  {
    id: 1,
    title: "Youth Bible Study",
    date: "2024-01-15",
    time: "7:00 PM",
    location: "Youth Room",
    description: "Join us for an interactive Bible study focused on living out faith in daily life.",
    attendees: 25,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Community Outreach",
    date: "2024-01-20",
    time: "9:00 AM",
    location: "Downtown Park",
    description: "Serve our community by providing meals and care packages to those in need.",
    attendees: 40,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Family Movie Night",
    date: "2024-01-25",
    time: "6:30 PM",
    location: "Fellowship Hall",
    description: "Bring the whole family for a fun evening with popcorn, games, and a great movie.",
    attendees: 60,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function UpcomingEvents() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Upcoming Events</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join us for these exciting opportunities to connect, grow, and serve together as a community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <div className="flex items-center space-x-1 text-sm font-semibold text-slate-800">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{event.title}</h3>

                  <div className="space-y-2 mb-4 text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-4">{event.description}</p>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Learn More</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
            <Link href="/events">View All Events</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
