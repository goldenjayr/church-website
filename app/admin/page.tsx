"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  Calendar,
  ImageIcon,
  BookOpen,
  Heart,
  MessageSquare,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Eye,
} from "lucide-react"
import { getCurrentUser, setCurrentUser, type User } from "@/lib/prisma"
import { LoginForm } from "@/components/admin/login-form"
import { AdminNavigation } from "@/components/admin/admin-navigation"

// Mock stats data
const stats = [
  {
    title: "Total Members",
    value: "342",
    change: "+12 this month",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Blog Posts",
    value: "28",
    change: "+3 this week",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Upcoming Events",
    value: "8",
    change: "2 this weekend",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Prayer Requests",
    value: "15",
    change: "5 new today",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
]

// Mock recent activity
const recentActivity = [
  {
    id: 1,
    type: "blog",
    title: "New blog post published",
    description: "Walking in Faith Daily",
    time: "2 hours ago",
    user: "Pastor John",
  },
  {
    id: 2,
    type: "event",
    title: "Event created",
    description: "Youth Bible Study",
    time: "4 hours ago",
    user: "Sarah Wilson",
  },
  {
    id: 3,
    type: "prayer",
    title: "Prayer request submitted",
    description: "Healing for family member",
    time: "6 hours ago",
    user: "Anonymous",
  },
  {
    id: 4,
    type: "member",
    title: "New member registered",
    description: "John and Mary Smith",
    time: "1 day ago",
    user: "System",
  },
]

// Mock content overview
const contentOverview = [
  {
    title: "Blog Posts",
    count: 28,
    published: 25,
    drafts: 3,
    icon: FileText,
    href: "/admin/blog",
  },
  {
    title: "Events",
    count: 12,
    published: 8,
    drafts: 4,
    icon: Calendar,
    href: "/admin/events",
  },
  {
    title: "Gallery Images",
    count: 156,
    published: 150,
    drafts: 6,
    icon: ImageIcon,
    href: "/admin/gallery",
  },
  {
    title: "Doctrines",
    count: 8,
    published: 8,
    drafts: 0,
    icon: BookOpen,
    href: "/admin/doctrines",
  },
]

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setCurrentUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentUser(null)
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
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Welcome back, {user.name}! Here's what's happening at Divine Jesus Church.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                        <p className="text-sm text-slate-500 mt-1">{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Content Overview */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Content Overview</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentOverview.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                            <p className="text-sm text-slate-600">
                              {item.published} published, {item.drafts} drafts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.count} total</Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {activity.type === "blog" && <FileText className="w-4 h-4 text-blue-600" />}
                          {activity.type === "event" && <Calendar className="w-4 h-4 text-green-600" />}
                          {activity.type === "prayer" && <Heart className="w-4 h-4 text-red-600" />}
                          {activity.type === "member" && <Users className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          <p className="text-sm text-slate-600 truncate">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {activity.time} • {activity.user}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <FileText className="w-6 h-6" />
                    <span className="text-xs">New Post</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <Calendar className="w-6 h-6" />
                    <span className="text-xs">Add Event</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">Upload Photo</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-xs">View Messages</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
                    <Settings className="w-6 h-6" />
                    <span className="text-xs">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
