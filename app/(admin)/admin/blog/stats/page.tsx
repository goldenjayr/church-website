"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Eye, 
  Heart, 
  TrendingUp, 
  Users, 
  Clock, 
  MousePointer,
  Share2,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Globe,
  Link,
  ChevronRight,
  Calendar,
  User,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { formatDistanceToNow } from "date-fns"

export default function BlogStatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN") {
        try {
          const response = await fetch("/api/admin/blog/stats")
          if (response.ok) {
            const data = await response.json()
            setStats(data)
          }
        } catch (error) {
          console.error("Error loading stats:", error)
        }
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

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "0s"
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
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

  const totalStats = stats?.totalStats?._sum || {}
  const engagementStats = stats?.engagementStats || {}

  return (
    <AdminPageLayout user={user} onLogout={handleLogout}>
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Blog Analytics</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Comprehensive statistics and insights</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/blog")}
              className="justify-center"
            >
              Back to Blog Posts
            </Button>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs hidden sm:inline-flex">
                    Total
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {formatNumber(totalStats.totalViews)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">Total Views</p>
                  <p className="text-xs text-slate-500">
                    {formatNumber(totalStats.uniqueViews)} unique
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <Badge variant="secondary" className="bg-red-50 text-red-700 text-xs hidden sm:inline-flex">
                    Engagement
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {formatNumber(totalStats.totalLikes)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">Total Likes</p>
                  <p className="text-xs text-slate-500">
                    {stats?.posts?.length || 0} posts
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs hidden sm:inline-flex">
                    Time
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {formatDuration(engagementStats._avg?.timeOnPage)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">Avg. Time</p>
                  <p className="text-xs text-slate-500">
                    {Math.round(engagementStats._avg?.scrollDepth || 0)}% scroll
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MousePointer className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs hidden sm:inline-flex">
                    Clicks
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {formatNumber(engagementStats._sum?.clicks)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">Total Clicks</p>
                  <p className="text-xs text-slate-500">
                    {formatNumber(engagementStats._sum?.shares)} shares
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Posts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Top Posts by Views */}
            <Card className="border-none shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="truncate">Top Posts by Views</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {stats?.topByViews?.map((post: any, index: number) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/blog/${post.id}/stats`)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-blue-700 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate text-sm sm:text-base">{post.title}</p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {formatNumber(post.stats?.totalViews || 0)} views
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Liked Posts */}
            <Card className="border-none shadow-md sm:shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <span className="truncate">Most Liked Posts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {stats?.topByLikes?.map((post: any, index: number) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/blog/${post.id}/stats`)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-red-700 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate text-sm sm:text-base">{post.title}</p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {formatNumber(post.stats?.totalLikes || 0)} likes
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Posts with Stats - Mobile Optimized */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">All Posts Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Post</th>
                      <th className="text-center py-3 px-4 font-medium text-slate-700">Views</th>
                      <th className="text-center py-3 px-4 font-medium text-slate-700">Likes</th>
                      <th className="text-center py-3 px-4 font-medium text-slate-700">Engagement</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Recent Likers</th>
                      <th className="text-center py-3 px-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.posts?.map((post: any) => (
                      <tr key={post.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{post.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                                {post.published ? "Published" : "Draft"}
                              </Badge>
                              {post.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                              )}
                              {post.category && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: post.category.color,
                                    color: post.category.color
                                  }}
                                >
                                  {post.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {formatNumber(post.stats?.totalViews || 0)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatNumber(post.stats?.uniqueViews || 0)} unique
                            </p>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {formatNumber(post.stats?.totalLikes || 0)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {post.likes?.length || 0} recent
                            </p>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {post._count?.engagements || 0}
                            </p>
                            <p className="text-xs text-slate-500">sessions</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex -space-x-2 overflow-hidden">
                            {post.likes?.slice(0, 5).map((like: any, index: number) => (
                              <div
                                key={index}
                                className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ring-2 ring-white flex items-center justify-center"
                                title={`${like.user.name} (${like.user.email})`}
                              >
                                <span className="text-xs font-semibold text-white">
                                  {like.user.name?.charAt(0) || like.user.email?.charAt(0) || '?'}
                                </span>
                              </div>
                            ))}
                            {post.likes?.length > 5 && (
                              <div className="inline-block h-8 w-8 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center">
                                <span className="text-xs font-semibold text-slate-600">
                                  +{post.likes.length - 5}
                                </span>
                              </div>
                            )}
                            {post.likes?.length === 0 && (
                              <span className="text-sm text-slate-400">No likes yet</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/blog/${post.id}/stats`)}
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {stats?.posts?.map((post: any) => (
                  <div key={post.id} className="border-b last:border-b-0 p-4 hover:bg-slate-50">
                    <div className="mb-3">
                      <h3 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2">{post.title}</h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                        {post.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                        )}
                        {post.category && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: post.category.color,
                              color: post.category.color
                            }}
                          >
                            {post.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Views</p>
                        <p className="font-semibold text-slate-900">
                          {formatNumber(post.stats?.totalViews || 0)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatNumber(post.stats?.uniqueViews || 0)} unique
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Likes</p>
                        <p className="font-semibold text-slate-900">
                          {formatNumber(post.stats?.totalLikes || 0)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {post.likes?.length || 0} recent
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Engagement</p>
                        <p className="font-semibold text-slate-900">
                          {post._count?.engagements || 0}
                        </p>
                        <p className="text-xs text-slate-500">sessions</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2 overflow-hidden">
                        {post.likes?.slice(0, 3).map((like: any, index: number) => (
                          <div
                            key={index}
                            className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ring-2 ring-white flex items-center justify-center"
                            title={`${like.user.name} (${like.user.email})`}
                          >
                            <span className="text-xs font-semibold text-white">
                              {like.user.name?.charAt(0) || like.user.email?.charAt(0) || '?'}
                            </span>
                          </div>
                        ))}
                        {post.likes?.length > 3 && (
                          <div className="inline-block h-6 w-6 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center">
                            <span className="text-xs font-semibold text-slate-600">
                              +{post.likes.length - 3}
                            </span>
                          </div>
                        )}
                        {post.likes?.length === 0 && (
                          <span className="text-xs text-slate-400">No likes yet</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/blog/${post.id}/stats`)}
                        className="text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {stats?.recentActivity?.length > 0 && (
            <Card className="border-none shadow-md sm:shadow-lg mt-6 sm:mt-8">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="truncate">Recent Activity (Last 7 Days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate text-sm sm:text-base">{activity.title}</p>
                        <p className="text-xs sm:text-sm text-slate-500">
                          {activity._count.id} views in the last 7 days
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/blog/${activity.blogPostId}/stats`)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
