"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  TrendingUp,
  TrendingDown,
  UserPlus,
  Clock,
  Bell,
  ChevronRight,
  Activity,
  Download,
  Star,
  HandHeart,
  Briefcase,
} from "lucide-react"
import { getCurrentUser, setCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { cn } from "@/lib/utils"

import { getDashboardData, getQuickStats } from "@/lib/dashboard-actions";
import { exportToCSV, exportToJSON, generateDashboardReport } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const router = useRouter();

  const loadData = async () => {
    const [currentUser, data] = await Promise.all([
      getCurrentUser(),
      getDashboardData(),
    ]);
    setUser(currentUser);
    setDashboardData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = async () => {
    await setCurrentUser(null)
    setUser(null)
    router.push('/login')
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
          {/* Header with refresh button - Mobile optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
                  Welcome back{user.name ? `, ${user.name}` : ''}!
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href="/admin/analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid - Core metrics only - Mobile optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {dashboardData &&
              [
                {
                  title: "Total Members",
                  value: dashboardData.stats.totalMembers,
                  change: dashboardData.stats.monthlyMembers > 0
                    ? `+${dashboardData.stats.monthlyMembers} this month`
                    : "No new this month",
                  icon: Users,
                  color: "text-blue-600",
                  bgColor: "bg-blue-100",
                  trend: dashboardData.stats.monthlyMembers > 0 ? "up" : "neutral",
                  href: "/admin/members"
                },
                {
                  title: "Blog Posts",
                  value: dashboardData.stats.totalBlogPosts,
                  icon: FileText,
                  color: "text-green-600",
                  bgColor: "bg-green-100",
                  href: "/admin/blog"
                },
                {
                  title: "Upcoming Events",
                  value: dashboardData.stats.upcomingEvents,
                  icon: Calendar,
                  color: "text-purple-600",
                  bgColor: "bg-purple-100",
                  href: "/admin/events"
                },
                {
                  title: "Unread Messages",
                  value: dashboardData.stats.unreadMessages,
                  change: dashboardData.stats.todayMessages > 0
                    ? `${dashboardData.stats.todayMessages} today`
                    : "None today",
                  icon: MessageSquare,
                  color: "text-orange-600",
                  bgColor: "bg-orange-100",
                  trend: dashboardData.stats.todayMessages > 0 ? "up" : "neutral",
                  href: "/admin/messages"
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={stat.href || "#"}>
                    <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                            <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                          </div>
                          {stat.trend && (
                            <div className="hidden sm:block">
                              {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                              {stat.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.title}</p>
                          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                          {stat.change && (
                            <p className="text-xs text-slate-500 mt-1 hidden sm:block">{stat.change}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Content Overview - Mobile optimized */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="border-none shadow-md sm:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-slate-700" />
                      <span className="text-slate-900">Content Overview</span>
                    </span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
                      onClick={() => router.push('/admin/blog/new')}
                    >
                      <Plus className="w-4 h-4 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                      <span className="font-medium">New Post</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData &&
                      [
                        {
                          title: "Blog Posts",
                          published: dashboardData.contentOverview.blogPosts.published,
                          drafts: dashboardData.contentOverview.blogPosts.drafts,
                          total: dashboardData.contentOverview.blogPosts.total,
                          icon: FileText,
                          href: "/admin/blog",
                          statusLabels: { published: "published", drafts: "drafts" }
                        },
                        {
                          title: "Events",
                          published: dashboardData.contentOverview.events.published,
                          drafts: dashboardData.contentOverview.events.drafts,
                          total: dashboardData.contentOverview.events.total,
                          icon: Calendar,
                          href: "/admin/events",
                          statusLabels: { published: "published", drafts: "drafts" }
                        },
                        {
                          title: "Members",
                          published: dashboardData.contentOverview.members.active,
                          drafts: dashboardData.contentOverview.members.inactive,
                          total: dashboardData.contentOverview.members.total,
                          icon: Users,
                          href: "/admin/members",
                          statusLabels: { published: "active", drafts: "inactive" }
                        },
                        {
                          title: "Positions",
                          published: dashboardData.contentOverview.positions.active,
                          drafts: dashboardData.contentOverview.positions.inactive,
                          total: dashboardData.contentOverview.positions.total,
                          icon: Briefcase,
                          href: "/admin/positions",
                          statusLabels: { published: "active", drafts: "inactive" }
                        },
                        {
                          title: "Doctrines",
                          published: dashboardData.contentOverview.doctrines.published,
                          drafts: dashboardData.contentOverview.doctrines.drafts,
                          total: dashboardData.contentOverview.doctrines.total,
                          icon: BookOpen,
                          href: "/admin/doctrines",
                          statusLabels: { published: "published", drafts: "drafts" }
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Link href={item.href}>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <item.icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                  <p className="text-sm text-slate-600">
                                    {item.published} {item.statusLabels.published}, {item.drafts} {item.statusLabels.drafts}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-white">{item.total} total</Badge>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - Mobile optimized */}
            <div className="order-1 lg:order-2">
              <Card className="border-none shadow-md sm:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData &&
                      dashboardData.recentActivity.map((activity: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {activity.type === "blog" && <FileText className="w-4 h-4 text-blue-600" />}
                            {activity.type === "event" && <Calendar className="w-4 h-4 text-green-600" />}
                            {activity.type === "member" && <Users className="w-4 h-4 text-purple-600" />}
                            {activity.type === "message" && <MessageSquare className="w-4 h-4 text-orange-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                            <p className="text-sm text-slate-600 truncate">{activity.description}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(activity.createdAt).toLocaleDateString()} • {activity.user}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions - Enhanced with more functionality - Mobile optimized */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Quick Actions Card - Mobile optimized */}
            <Card className="border-none shadow-md sm:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors p-2"
                    onClick={() => router.push('/admin/blog/new')}
                  >
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <span className="text-xs font-medium">New Post</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-colors p-2"
                    onClick={() => router.push('/admin/events/new')}
                  >
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    <span className="text-xs font-medium">Add Event</span>
                  </Button>
                  <Link href="/admin/messages" className="relative">
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors w-full relative p-2"
                    >
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      <span className="text-xs font-medium">Messages</span>
                      {dashboardData?.stats.unreadMessages > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0 h-5 min-w-[20px] flex items-center justify-center text-xs">
                          {dashboardData.stats.unreadMessages}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 hover:bg-indigo-50 hover:border-indigo-300 transition-colors p-2"
                    onClick={() => router.push('/admin/members/new')}
                  >
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    <span className="text-xs font-medium">Add Member</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 hover:bg-slate-50 hover:border-slate-300 transition-colors p-2"
                    asChild
                  >
                    <Link href="/admin/settings">
                      <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                      <span className="text-xs font-medium">Settings</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 hover:bg-green-50 hover:border-green-300 transition-colors p-2"
                    onClick={() => router.push('/admin/doctrines')}
                  >
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    <span className="text-xs font-medium">Doctrines</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Health / Notifications - Mobile optimized */}
            <Card className="border-none shadow-md sm:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Unread Messages */}
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Unread Messages</p>
                        <p className="text-xs text-slate-600">
                          {dashboardData?.stats.unreadMessages || 0} messages need attention
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/admin/messages">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Upcoming Events */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Upcoming Events</p>
                        <p className="text-xs text-slate-600">
                          {dashboardData?.stats.upcomingEvents || 0} events scheduled
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/admin/events">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* New Members This Month */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">New Members</p>
                        <p className="text-xs text-slate-600">
                          {dashboardData?.stats.monthlyMembers || 0} joined this month
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/admin/members">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Export Data */}
                  <div className="pt-2 border-t">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Dashboard Data
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (dashboardData) {
                              exportToCSV(dashboardData, 'church-dashboard');
                              toast({
                                title: "Export Successful",
                                description: "Dashboard data exported as CSV",
                              });
                            }
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (dashboardData) {
                              exportToJSON(dashboardData, 'church-dashboard');
                              toast({
                                title: "Export Successful",
                                description: "Dashboard data exported as JSON",
                              });
                            }
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (dashboardData) {
                              const report = generateDashboardReport(dashboardData);
                              const blob = new Blob([report], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `church-report-${new Date().toISOString().split('T')[0]}.txt`;
                              link.click();
                              URL.revokeObjectURL(url);
                              toast({
                                title: "Report Generated",
                                description: "Dashboard report downloaded successfully",
                              });
                            }
                          }}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
