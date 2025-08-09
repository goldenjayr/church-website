"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  Search,
  Users,
  MessageSquare,
  Clock,
  MapPin
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { toast } from "sonner"
import { formatTime12Hour } from "@/lib/time-utils"

interface EventRSVP {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  createdAt: string
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  maxAttendees: number | null
}

export default function EventRSVPsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<EventRSVP[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eventId, setEventId] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      // Get the event ID from params
      const { id } = await params
      setEventId(id)
      
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN") {
        // Fetch event details
        try {
          const eventResponse = await fetch(`/api/admin/events/${id}`)
          if (eventResponse.ok) {
            const eventData = await eventResponse.json()
            setEvent(eventData)
          }
        } catch (error) {
          console.error("Failed to fetch event:", error)
        }

        // Fetch RSVPs
        try {
          const rsvpsResponse = await fetch(`/api/events/rsvp?eventId=${id}`)
          if (rsvpsResponse.ok) {
            const data = await rsvpsResponse.json()
            setRsvps(data.rsvps || [])
          }
        } catch (error) {
          console.error("Failed to fetch RSVPs:", error)
          toast.error("Failed to load RSVPs")
        }
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const filteredRSVPs = rsvps.filter((rsvp) =>
    rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rsvp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rsvp.phone && rsvp.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Message", "Registration Date"]
    const csvData = [
      headers.join(","),
      ...rsvps.map(rsvp => [
        rsvp.name,
        rsvp.email,
        rsvp.phone || "",
        rsvp.message ? `"${rsvp.message.replace(/"/g, '""')}"` : "",
        new Date(rsvp.createdAt).toLocaleString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event?.title.replace(/\s+/g, '-')}-rsvps-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("RSVPs exported successfully!")
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/events")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
            
            {event && (
              <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime12Hour(event.time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{rsvps.length}</div>
                      <div className="text-sm text-slate-600">Total RSVPs</div>
                      {event.maxAttendees && (
                        <Badge 
                          variant={rsvps.length >= event.maxAttendees ? "destructive" : "default"}
                          className="mt-2"
                        >
                          {event.maxAttendees - rsvps.length > 0 
                            ? `${event.maxAttendees - rsvps.length} spots remaining`
                            : "Event Full"
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Bar */}
          <Card className="border-none shadow-xl mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button
                  onClick={exportToCSV}
                  disabled={rsvps.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RSVPs List */}
          {filteredRSVPs.length > 0 ? (
            <div className="grid gap-4">
              {filteredRSVPs.map((rsvp, index) => (
                <motion.div
                  key={rsvp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900">{rsvp.name}</h3>
                              <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Mail className="w-4 h-4" />
                                  <a href={`mailto:${rsvp.email}`} className="hover:text-purple-600 transition-colors">
                                    {rsvp.email}
                                  </a>
                                </div>
                                {rsvp.phone && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${rsvp.phone}`} className="hover:text-purple-600 transition-colors">
                                      {rsvp.phone}
                                    </a>
                                  </div>
                                )}
                                {rsvp.message && (
                                  <div className="flex items-start gap-2 text-sm text-slate-600 mt-2">
                                    <MessageSquare className="w-4 h-4 mt-0.5" />
                                    <p className="italic">{rsvp.message}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            Registered {new Date(rsvp.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  {searchTerm ? "No RSVPs found" : "No RSVPs yet"}
                </h3>
                <p className="text-slate-500">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "RSVPs will appear here when people register for this event"}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
