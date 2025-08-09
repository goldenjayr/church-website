
"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Calendar as CalendarIcon, Clock, MapPin, Users, Eye, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User, Event } from "@prisma/client"
import { getEvents, deleteEvent } from "@/lib/event-actions"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { toast } from "sonner"
import { formatTime12Hour } from "@/lib/time-utils"

export default function AdminEventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN") {
        const eventsData = await getEvents()
        setEvents(eventsData)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteEvent = async (id: string) => {
    if (!id) return
    setDeletingId(id)
    try {
      const result = await deleteEvent(id)

      if (result.success) {
        toast.success("Event deleted successfully!")
        setEvents(prev => prev.filter(event => event.id !== id))
      } else {
        toast.error(result.error || "Failed to delete event")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the event")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <AdminPageLayout user={user} onLogout={handleLogout}>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header - Mobile optimized */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Events</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Manage your church events</p>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:hover:scale-105 border-0 text-sm sm:text-base justify-center"
              onClick={() => router.push("/admin/events/new")}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="font-semibold">New Event</span>
            </Button>
          </div>

          {/* Search - Mobile optimized */}
          <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 mb-6 sm:mb-8 sm:hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200 w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Events Grid - Mobile optimized */}
          <div className="grid gap-4 sm:gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="flex">
                    <div className="w-1 sm:w-2 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                    <CardContent className="p-4 sm:p-6 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center gap-3 mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-2">{event.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 mt-1">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{formatTime12Hour(event.time)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 line-clamp-2">{event.description}</p>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge 
                              variant={event.published ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {event.published ? "Published" : "Draft"}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            {event.maxAttendees && (
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{event.maxAttendees} max</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => router.push(`/admin/events/${event.id}/rsvps`)}
                            title="View RSVPs"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => window.open(`/events/${event.id}`, '_blank')}
                            title="Preview Event"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deletingId === event.id}
                          >
                            {deletingId === event.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No events found</h3>
              <p className="text-slate-500">
                {searchTerm ? "Try adjusting your search" : "No events available"}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
