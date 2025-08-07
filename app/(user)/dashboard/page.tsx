"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  FileText,
  Heart,
  Users,
  LogOut,
  User,
  Settings,
  Bell,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Clock,
  MapPin,
  Newspaper,
  CalendarDays,
  Home,
} from "lucide-react"
import { getCurrentUser, logout } from "@/lib/auth-actions"
import type { User as UserType } from "@prisma/client"

export default function UserDashboard() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
      } else if (currentUser.role === "ADMIN") {
        router.push("/admin")
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const quickLinks = [
    {
      title: "Upcoming Events",
      description: "View and RSVP to church events",
      icon: Calendar,
      href: "/events",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Blog & Sermons",
      description: "Read latest posts and sermons",
      icon: FileText,
      href: "/blog",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Our Doctrines",
      description: "Learn about our beliefs",
      icon: BookOpen,
      href: "/doctrines",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Contact Us",
      description: "Get in touch with the church",
      icon: MessageSquare,
      href: "/contact",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const recentActivities = [
    {
      title: "Sunday Service",
      time: "This Sunday, 10:00 AM",
      icon: Calendar,
      type: "event",
    },
    {
      title: "New Blog Post",
      time: "2 days ago",
      description: "Walking in Faith: A Daily Journey",
      icon: Newspaper,
      type: "blog",
    },
    {
      title: "Bible Study",
      time: "Wednesday, 7:00 PM",
      icon: BookOpen,
      type: "event",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-800">Divine Jesus Church</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                <Home className="w-5 h-5" />
              </Link>
              <Link href="/events" className="text-slate-600 hover:text-slate-900 transition-colors">
                Events
              </Link>
              <Link href="/blog" className="text-slate-600 hover:text-slate-900 transition-colors">
                Blog
              </Link>
              <Link href="/donate" className="text-slate-600 hover:text-slate-900 transition-colors">
                Donate
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-slate-600" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{user.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.name || "Friend"}!
            </h1>
            <p className="text-slate-600 mt-2">
              Stay connected with your church community and grow in faith.
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={link.href}>
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${link.bgColor} rounded-full flex items-center justify-center mb-4`}>
                        <link.icon className={`w-6 h-6 ${link.color}`} />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{link.title}</h3>
                      <p className="text-sm text-slate-600">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent & Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-b-0"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'event' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <activity.icon className={`w-5 h-5 ${
                            activity.type === 'event' ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-slate-600">{activity.description}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </motion.div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    asChild
                  >
                    <Link href="/events">
                      View All Events
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/events">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      RSVP to Events
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/donate">
                      <Heart className="w-4 h-4 mr-2" />
                      Make a Donation
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/contact">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Church
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Daily Verse */}
              <Card className="border-none shadow-lg mt-4 bg-gradient-to-br from-blue-50 to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5" />
                    Daily Verse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 italic">
                    "For God so loved the world that he gave his one and only Son, 
                    that whoever believes in him shall not perish but have eternal life."
                  </p>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    - John 3:16
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
