"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Filter, ChevronDown } from "lucide-react"

// Mock events data
const events = [
  {
    id: "1",
    title: "Youth Bible Study",
    description:
      "Join us for an interactive Bible study focused on living out faith in daily life. We'll explore practical applications of Scripture and enjoy fellowship together.",
    date: "2024-01-15",
    time: "7:00 PM",
    location: "Youth Room",
    category: "Youth",
    attendees: 25,
    maxAttendees: 30,
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "2",
    title: "Community Outreach",
    description:
      "Serve our community by providing meals and care packages to those in need. This is a great opportunity to show God's love in action.",
    date: "2024-01-20",
    time: "9:00 AM",
    location: "Downtown Park",
    category: "Outreach",
    attendees: 40,
    maxAttendees: 50,
    image: "/placeholder.svg?height=200&width=300",
    featured: true,
  },
  {
    id: "3",
    title: "Family Movie Night",
    description:
      "Bring the whole family for a fun evening with popcorn, games, and a great movie. A perfect time for fellowship and relaxation.",
    date: "2024-01-25",
    time: "6:30 PM",
    location: "Fellowship Hall",
    category: "Family",
    attendees: 60,
    maxAttendees: 80,
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "4",
    title: "Women's Prayer Breakfast",
    description:
      "Ladies, join us for a time of prayer, encouragement, and delicious breakfast. Come ready to be blessed and be a blessing.",
    date: "2024-01-28",
    time: "8:00 AM",
    location: "Church Kitchen",
    category: "Women",
    attendees: 15,
    maxAttendees: 25,
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "5",
    title: "Men's Fellowship Breakfast",
    description: "Men of all ages are invited to join us for breakfast, fellowship, and a short devotional message.",
    date: "2024-02-03",
    time: "7:30 AM",
    location: "Fellowship Hall",
    category: "Men",
    attendees: 20,
    maxAttendees: 30,
    image: "/placeholder.svg?height=200&width=300",
    featured: false,
  },
  {
    id: "6",
    title: "Church Picnic",
    description:
      "Our annual church picnic with games, food, and fun for the whole family. Don't miss this special time of community celebration.",
    date: "2024-02-10",
    time: "11:00 AM",
    location: "City Park",
    category: "Family",
    attendees: 120,
    maxAttendees: 150,
    image: "/placeholder.svg?height=200&width=300",
    featured: true,
  },
]

const categories = ["All", "Youth", "Family", "Outreach", "Women", "Men", "Worship"]

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const filteredEvents =
    selectedCategory === "All" ? events : events.filter((event) => event.category === selectedCategory)

  const featuredEvents = events.filter((event) => event.featured)
  const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date())

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Church Events</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Join us for fellowship, worship, and community activities throughout the year
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Featured Events</h2>
              <p className="text-lg text-slate-600">Don't miss these special upcoming events</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{event.title}</h3>

                      <div className="space-y-2 mb-4 text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
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
                          <span>
                            {event.attendees}/{event.maxAttendees} attending
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed mb-4">{event.description}</p>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">RSVP Now</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="py-8 bg-slate-100 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">All Events</h2>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              <div className={`flex flex-wrap gap-2 ${showFilters ? "block" : "hidden lg:flex"}`}>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600">No events found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
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
                      {event.featured && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{event.title}</h3>

                      <div className="space-y-2 mb-4 text-slate-600 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
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
                          <span>
                            {event.attendees}/{event.maxAttendees} attending
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed mb-4 text-sm line-clamp-3">{event.description}</p>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Learn More</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
