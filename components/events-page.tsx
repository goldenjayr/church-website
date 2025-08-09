"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Filter, 
  ChevronDown,
  Search,
  CalendarDays,
  Heart,
  Sparkles,
  Church,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Grid3x3,
  List,
  X,
  ArrowRight,
  Tag
} from "lucide-react"
import { Event } from "@prisma/client"
import Link from "next/link"
import { format, isPast, isToday, isTomorrow, differenceInDays, addDays } from "date-fns"

interface EventWithRSVPCount extends Event {
  _count?: {
    rsvps: number
  }
}

interface IProps {
  events: EventWithRSVPCount[]
}

export function EventsPage(props: IProps) {
  const { events } = props
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Enhanced event categorization
  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    
    if (isPast(eventDate)) return "past"
    if (isToday(eventDate)) return "today"
    if (isTomorrow(eventDate)) return "tomorrow"
    const daysUntil = differenceInDays(eventDate, now)
    if (daysUntil <= 7) return "this-week"
    if (daysUntil <= 30) return "this-month"
    return "upcoming"
  }

  const getEventType = (event: Event) => {
    const title = event.title.toLowerCase()
    if (title.includes("worship") || title.includes("service")) return "worship"
    if (title.includes("youth") || title.includes("teen") || title.includes("kids")) return "youth"
    if (title.includes("bible") || title.includes("study")) return "study"
    if (title.includes("prayer")) return "prayer"
    if (title.includes("community") || title.includes("outreach")) return "community"
    return "general"
  }

  const categories = ["All", ...new Set(events.map(event => event.location))]

  // Enhanced filtering
  const filteredEvents = useMemo(() => {
    let filtered = [...events]
    
    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(event => event.location === selectedCategory)
    }
    
    // Time filter
    const now = new Date()
    switch (selectedTimeFilter) {
      case "upcoming":
        filtered = filtered.filter(event => new Date(event.date) >= now)
        break
      case "past":
        filtered = filtered.filter(event => new Date(event.date) < now)
        break
      case "this-week":
        const weekEnd = addDays(now, 7)
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate >= now && eventDate <= weekEnd
        })
        break
      case "this-month":
        const monthEnd = addDays(now, 30)
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate >= now && eventDate <= monthEnd
        })
        break
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      )
    }
    
    // Sort by date (upcoming first)
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, selectedCategory, selectedTimeFilter, searchQuery])

  const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date())
  const featuredEvents = upcomingEvents.slice(0, 2)



  // Event type colors and icons
  const eventTypeConfig = {
    worship: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Church },
    youth: { color: "bg-pink-100 text-pink-700 border-pink-200", icon: Heart },
    study: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Calendar },
    prayer: { color: "bg-green-100 text-green-700 border-green-200", icon: Sparkles },
    community: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: Users },
    general: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: CalendarDays },
  }

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d, yyyy")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div 
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Calendar className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Church Events</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join us for fellowship, worship, and community activities throughout the year
            </p>
            
            {/* Quick stats - Mobile optimized */}
            <div className="flex justify-center gap-4 sm:gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{upcomingEvents.length}</div>
                <div className="text-xs sm:text-sm text-blue-100">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{events.filter(e => isToday(new Date(e.date))).length}</div>
                <div className="text-xs sm:text-sm text-blue-100">Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  {events.filter(e => {
                    const d = new Date(e.date)
                    return d >= new Date() && d <= addDays(new Date(), 7)
                  }).length}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">This Week</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
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
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured Events
              </Badge>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Don't Miss These Events</h2>
              <p className="text-lg text-slate-600">Join us for these special upcoming gatherings</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredEvents.map((event, index) => {
                const eventType = getEventType(event)
                const eventStatus = getEventStatus(event)
                const typeConfig = eventTypeConfig[eventType as keyof typeof eventTypeConfig]
                const Icon = typeConfig.icon
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-20 h-20 text-slate-300" />
                          </div>
                        )}
                        
                        {/* Status badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {eventStatus === "today" && (
                            <Badge className="bg-red-500 text-white border-0">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Today
                            </Badge>
                          )}
                          {eventStatus === "tomorrow" && (
                            <Badge className="bg-orange-500 text-white border-0">
                              Tomorrow
                            </Badge>
                          )}
                          {eventStatus === "this-week" && (
                            <Badge className="bg-blue-500 text-white border-0">
                              This Week
                            </Badge>
                          )}
                        </div>
                        
                        {/* Event type badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className={`${typeConfig.color} border`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>

                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="flex items-center text-slate-600">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">{formatEventDate(new Date(event.date))}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <Clock className="w-4 h-4 mr-2 text-green-500" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-slate-600 col-span-2">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {event.maxAttendees && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-600">Attendance</span>
                              <span className="font-medium">
                                {event._count?.rsvps || 0} / {event.maxAttendees} registered
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  ((event._count?.rsvps || 0) / event.maxAttendees) >= 0.9 
                                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                                    : ((event._count?.rsvps || 0) / event.maxAttendees) >= 0.7
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                    : "bg-gradient-to-r from-blue-500 to-green-500"
                                }`}
                                style={{ width: `${Math.min(((event._count?.rsvps || 0) / event.maxAttendees) * 100, 100)}%` }} 
                              />
                            </div>
                            {((event._count?.rsvps || 0) / event.maxAttendees) >= 1 && (
                              <p className="text-xs text-red-600 mt-1 font-medium">Event Full</p>
                            )}
                            {((event._count?.rsvps || 0) / event.maxAttendees) >= 0.9 && ((event._count?.rsvps || 0) / event.maxAttendees) < 1 && (
                              <p className="text-xs text-orange-600 mt-1 font-medium">Almost Full</p>
                            )}
                          </div>
                        )}

                        <p className="text-slate-600 leading-relaxed mb-6 line-clamp-2">
                          {event.description}
                        </p>

                        <Link href={`/events/${event.id}`} passHref>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                            <UserCheck className="w-4 h-4 mr-2" />
                            View Details & RSVP
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Filters Section - Mobile optimized */}
      <section className="sticky top-0 z-10 py-3 sm:py-4 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar - Mobile optimized */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 sm:w-5 h-4 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 pr-4 h-10 sm:h-12 text-sm sm:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* View Mode Toggle - Mobile optimized */}
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  <Grid3x3 className="w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  <List className="w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
              </div>
            </div>
            
            {/* Filter Pills - Mobile optimized with horizontal scroll */}
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-2 pb-2 min-w-max">
                {/* Time filters */}
                <div className="flex gap-1 sm:gap-2 pr-3 sm:pr-4 border-r">
                  <Badge 
                    className={`cursor-pointer transition-all text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 ${
                      selectedTimeFilter === "all" 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                    }`}
                    onClick={() => setSelectedTimeFilter("all")}
                  >
                    All
                  </Badge>
                  <Badge 
                    className={`cursor-pointer transition-all text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 ${
                      selectedTimeFilter === "upcoming" 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                    }`}
                    onClick={() => setSelectedTimeFilter("upcoming")}
                  >
                    <TrendingUp className="w-3 h-3 mr-0.5 sm:mr-1" />
                    Upcoming
                  </Badge>
                  <Badge 
                    className={`cursor-pointer transition-all text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap ${
                      selectedTimeFilter === "this-week" 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                    }`}
                    onClick={() => setSelectedTimeFilter("this-week")}
                  >
                    Week
                  </Badge>
                  <Badge 
                    className={`cursor-pointer transition-all text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap ${
                      selectedTimeFilter === "this-month" 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                    }`}
                    onClick={() => setSelectedTimeFilter("this-month")}
                  >
                    Month
                  </Badge>
                  <Badge 
                    className={`cursor-pointer transition-all text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 ${
                      selectedTimeFilter === "past" 
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                    }`}
                    onClick={() => setSelectedTimeFilter("past")}
                  >
                    Past
                  </Badge>
                </div>
                
                {/* Location filters */}
                <div className="flex gap-1 sm:gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      className={`cursor-pointer transition-all text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap ${
                        selectedCategory === category 
                          ? "bg-green-600 text-white border-green-600 hover:bg-green-700" 
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === "All" && <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />}
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Results count - Mobile optimized */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1">
              <span>
                <span className="font-semibold">{filteredEvents.length}</span> 
                {filteredEvents.length === 1 ? " event" : " events"}
                {searchQuery && (
                  <span className="hidden sm:inline"> for "{searchQuery}"</span>
                )}
              </span>
              {searchQuery && (
                <span className="sm:hidden text-slate-500">filtered</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Display - Mobile optimized */}
      <section className="py-6 sm:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {filteredEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Events Found</h3>
              <p className="text-lg text-slate-600 mb-6">
                {searchQuery ? `No events match "${searchQuery}"` : "No events in this category"}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSelectedTimeFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : viewMode === "grid" ? (
            /* Grid View - Mobile optimized */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event, index) => {
                const eventType = getEventType(event)
                const eventStatus = getEventStatus(event)
                const typeConfig = eventTypeConfig[eventType as keyof typeof eventTypeConfig]
                const Icon = typeConfig.icon
                const isPastEvent = eventStatus === "past"
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                    viewport={{ once: true }}
                  >
                    <Card className={`h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                      isPastEvent ? "opacity-60" : ""
                    }`}>
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-16 h-16 text-slate-300" />
                          </div>
                        )}
                        
                        {/* Event badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {eventStatus === "today" && (
                            <Badge className="bg-red-500 text-white border-0 text-xs">
                              Today
                            </Badge>
                          )}
                          {eventStatus === "tomorrow" && (
                            <Badge className="bg-orange-500 text-white border-0 text-xs">
                              Tomorrow
                            </Badge>
                          )}
                          {isPastEvent && (
                            <Badge className="bg-slate-500 text-white border-0 text-xs">
                              Past Event
                            </Badge>
                          )}
                        </div>
                        
                        <div className="absolute top-3 right-3">
                          <Badge className={`${typeConfig.color} border backdrop-blur-sm text-xs`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>

                        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                          <div className="flex items-center text-slate-600">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">{formatEventDate(new Date(event.date))}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <Clock className="w-4 h-4 mr-2 text-green-500" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-slate-600">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>

                        {event.maxAttendees && (
                          <div className="mb-3 sm:mb-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Capacity</span>
                              <span className="font-medium">
                                {event.maxAttendees - (event._count?.rsvps || 0)} left
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1 sm:h-1.5">
                              <div 
                                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                                  ((event._count?.rsvps || 0) / event.maxAttendees) >= 0.9 
                                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                                    : ((event._count?.rsvps || 0) / event.maxAttendees) >= 0.7
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                    : "bg-gradient-to-r from-blue-500 to-green-500"
                                }`}
                                style={{ width: `${Math.min(((event._count?.rsvps || 0) / event.maxAttendees) * 100, 100)}%` }} 
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                          {event.description}
                        </p>

                        <Link href={`/events/${event.id}`} passHref>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base py-2 sm:py-2.5" disabled={isPastEvent}>
                            {isPastEvent ? "Event Ended" : "View Details"}
                            {!isPastEvent && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredEvents.map((event, index) => {
                const eventType = getEventType(event)
                const eventStatus = getEventStatus(event)
                const typeConfig = eventTypeConfig[eventType as keyof typeof eventTypeConfig]
                const Icon = typeConfig.icon
                const isPastEvent = eventStatus === "past"
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2) }}
                    viewport={{ once: true }}
                  >
                    <Card className={`border-none shadow-md hover:shadow-lg transition-all duration-300 ${
                      isPastEvent ? "opacity-60" : ""
                    }`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-green-100 relative flex-shrink-0">
                            {event.image ? (
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon className="w-12 h-12 text-slate-300" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  {eventStatus === "today" && (
                                    <Badge className="bg-red-500 text-white border-0 text-xs">
                                      Today
                                    </Badge>
                                  )}
                                  {eventStatus === "tomorrow" && (
                                    <Badge className="bg-orange-500 text-white border-0 text-xs">
                                      Tomorrow
                                    </Badge>
                                  )}
                                  {isPastEvent && (
                                    <Badge className="bg-slate-500 text-white border-0 text-xs">
                                      Past Event
                                    </Badge>
                                  )}
                                  <Badge className={`${typeConfig.color} border text-xs`}>
                                    <Icon className="w-3 h-3 mr-1" />
                                    {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                  {event.title}
                                </h3>
                              </div>
                              
                              <Link href={`/events/${event.id}`} passHref>
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                  disabled={isPastEvent}
                                >
                                  {isPastEvent ? "Event Ended" : "View Details"}
                                  {!isPastEvent && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                              </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-sm">
                              <div className="flex items-center text-slate-600">
                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                <span className="font-medium">{formatEventDate(new Date(event.date))}</span>
                              </div>
                              <div className="flex items-center text-slate-600">
                                <Clock className="w-4 h-4 mr-2 text-green-500" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center text-slate-600">
                                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                              {event.description}
                            </p>
                            
                            {event.maxAttendees && (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center text-sm text-slate-600">
                                  <Users className="w-4 h-4 mr-2" />
                                  <span>
                                    {event._count?.rsvps || 0} / {event.maxAttendees} registered
                                    {((event._count?.rsvps || 0) / event.maxAttendees) >= 1 && (
                                      <Badge className="ml-2 bg-red-500 text-white border-0 text-xs">Full</Badge>
                                    )}
                                  </span>
                                </div>
                                <div className="flex-1 max-w-xs">
                                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div 
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        ((event._count?.rsvps || 0) / event.maxAttendees) >= 0.9 
                                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                                          : ((event._count?.rsvps || 0) / event.maxAttendees) >= 0.7
                                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                          : "bg-gradient-to-r from-blue-500 to-green-500"
                                      }`}
                                      style={{ width: `${Math.min(((event._count?.rsvps || 0) / event.maxAttendees) * 100, 100)}%` }} 
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}