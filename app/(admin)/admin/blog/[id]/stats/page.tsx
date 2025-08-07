"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, 
  Heart, 
  Clock, 
  MousePointer,
  Globe,
  Link as LinkIcon,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  User,
  Calendar,
  Monitor,
  Smartphone,
  Bot,
  ExternalLink,
  ScrollText,
  Timer
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User as UserType } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { format, formatDistanceToNow } from "date-fns"

export default function BlogPostStatsPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN" && params.id) {
        try {
          const response = await fetch(`/api/admin/blog/${params.id}/stats`)
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
  }, [params.id])

  const handleLogin = (loggedInUser: UserType) => {
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

  if (!stats) {
    return (
      <AdminPageLayout user={user} onLogout={handleLogout}>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-600">No statistics available</p>
        </div>
      </AdminPageLayout>
    )
  }

  const viewAnalytics = stats.stats?.viewAnalytics || {}
  const engagementMetrics = stats.stats?.engagementMetrics || {}

  return (
    <AdminPageLayout user={user} onLogout={handleLogout}>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/blog/stats")}
                className="px-2 h-8"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back to Analytics</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 break-words">{stats.post?.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={stats.post?.published ? "default" : "secondary"} className="text-xs">
                    {stats.post?.published ? "Published" : "Draft"}
                  </Badge>
                  {stats.post?.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                  )}
                  {stats.post?.category && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: stats.post.category.color,
                        color: stats.post.category.color
                      }}
                    >
                      {stats.post.category.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/blog/${stats.post?.slug}`, '_blank')}
                  className="flex-1 sm:flex-initial"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">View Post</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push(`/admin/blog/${params.id}/edit`)}
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">Edit Post</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatNumber(viewAnalytics.totalViews)}
                    </p>
                    <p className="text-sm text-slate-600">Total Views</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unique:</span>
                    <span className="font-medium">{formatNumber(viewAnalytics.uniqueViews)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered:</span>
                    <span className="font-medium">{formatNumber(viewAnalytics.registeredViews)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Anonymous:</span>
                    <span className="font-medium">{formatNumber(viewAnalytics.anonymousViews)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-red-600" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatNumber(stats.stats?.totalLikes)}
                    </p>
                    <p className="text-sm text-slate-600">Total Likes</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-500">Recent likers:</p>
                  <div className="flex -space-x-2 overflow-hidden">
                    {stats.likers?.slice(0, 5).map((liker: any, index: number) => (
                      <div
                        key={index}
                        className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ring-2 ring-white flex items-center justify-center"
                        title={`${liker.name} (${liker.email})`}
                      >
                        <span className="text-xs font-semibold text-white">
                          {liker.name?.charAt(0) || liker.email?.charAt(0) || '?'}
                        </span>
                      </div>
                    ))}
                    {stats.likers?.length > 5 && (
                      <div className="inline-block h-6 w-6 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-600">
                          +{stats.likers.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatDuration(stats.stats?.avgViewDuration)}
                    </p>
                    <p className="text-sm text-slate-600">Avg. Duration</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg. Time:</span>
                    <span className="font-medium">{formatDuration(engagementMetrics.avgTimeOnPage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scroll Depth:</span>
                    <span className="font-medium">{Math.round(engagementMetrics.avgScrollDepth || 0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <MousePointer className="w-8 h-8 text-purple-600" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatNumber(engagementMetrics.totalEngagements)}
                    </p>
                    <p className="text-sm text-slate-600">Engagements</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clicks:</span>
                    <span className="font-medium">{formatNumber(engagementMetrics.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shares:</span>
                    <span className="font-medium">{formatNumber(engagementMetrics.totalShares)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for detailed data */}
          <Tabs defaultValue="likers" className="space-y-4">
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto min-w-full sm:min-w-0">
                <TabsTrigger value="likers" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Likers</span>
                </TabsTrigger>
                <TabsTrigger value="views" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Views</span>
                </TabsTrigger>
                <TabsTrigger value="engagement" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Engagement</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Likers Tab */}
            <TabsContent value="likers">
              <Card className="border-none shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    <span className="truncate">People Who Liked ({stats.likers?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {stats.likers?.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {stats.likers.map((liker: any) => (
                        <div key={liker.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 rounded-lg gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-semibold text-white">
                                {liker.name?.charAt(0) || liker.email?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 text-sm sm:text-base truncate">{liker.name || 'Anonymous'}</p>
                              <p className="text-xs sm:text-sm text-slate-500 truncate">{liker.email}</p>
                            </div>
                          </div>
                          <div className="text-right ml-10 sm:ml-0">
                            <p className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(liker.likedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8 text-sm sm:text-base">No likes yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Views Tab */}
            <TabsContent value="views">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Recent Views (Last 50)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Viewer</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Location</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Referrer</th>
                          <th className="text-center py-2 px-3 font-medium text-slate-700">Duration</th>
                          <th className="text-right py-2 px-3 font-medium text-slate-700">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentViews?.map((view: any) => (
                          <tr key={view.id} className="border-b hover:bg-slate-50">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {view.isBot ? (
                                  <Bot className="w-4 h-4 text-orange-500" />
                                ) : view.userId ? (
                                  <User className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <User className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="text-sm">
                                  {view.user?.name || view.user?.email || 'Anonymous'}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {view.city && view.country 
                                    ? `${view.city}, ${view.country}`
                                    : view.country || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-600 truncate max-w-[150px]">
                                  {view.referrer ? new URL(view.referrer).hostname : 'Direct'}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className="text-sm text-slate-600">
                                {formatDuration(view.viewDuration)}
                              </span>
                            </td>
                            <td className="text-right py-2 px-3">
                              <span className="text-sm text-slate-500">
                                {formatDistanceToNow(new Date(view.createdAt), { addSuffix: true })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    {stats.recentViews?.map((view: any) => (
                      <div key={view.id} className="border-b last:border-b-0 p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {view.isBot ? (
                              <Bot className="w-4 h-4 text-orange-500" />
                            ) : view.userId ? (
                              <User className="w-4 h-4 text-blue-500" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-sm font-medium">
                              {view.user?.name || view.user?.email || 'Anonymous'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(view.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{view.city && view.country ? `${view.city}, ${view.country}` : view.country || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{view.referrer ? new URL(view.referrer).hostname : 'Direct'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Duration: {formatDuration(view.viewDuration)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement">
              <Card className="border-none shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span>User Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-3">
                    {stats.recentEngagements?.length > 0 ? (
                      stats.recentEngagements.map((engagement: any) => (
                        <div key={engagement.id} className="border rounded-lg p-3 hover:bg-slate-50">
                          <div className="flex flex-col gap-2 mb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                {engagement.user ? (
                                  <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                )}
                                <span className="font-medium text-slate-900 text-sm truncate">
                                  {engagement.user?.name || engagement.user?.email || 'Anonymous'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatDistanceToNow(new Date(engagement.updatedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center">
                              <ScrollText className="w-3 h-3 text-slate-400 mx-auto mb-1" />
                              <p className="text-xs text-slate-500">Scroll</p>
                              <p className="font-medium text-sm">{Math.round(engagement.scrollDepth || 0)}%</p>
                            </div>
                            <div className="text-center">
                              <Timer className="w-3 h-3 text-slate-400 mx-auto mb-1" />
                              <p className="text-xs text-slate-500">Time</p>
                              <p className="font-medium text-sm">{formatDuration(engagement.timeOnPage)}</p>
                            </div>
                            <div className="text-center">
                              <MousePointer className="w-3 h-3 text-slate-400 mx-auto mb-1" />
                              <p className="text-xs text-slate-500">Clicks</p>
                              <p className="font-medium text-sm">{engagement.clicks || 0}</p>
                            </div>
                            <div className="text-center">
                              <TrendingUp className="w-3 h-3 text-slate-400 mx-auto mb-1" />
                              <p className="text-xs text-slate-500">Shares</p>
                              <p className="font-medium text-sm">{engagement.shares || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-500 py-8 text-sm">No engagement data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 gap-4">
                {/* Views by Country */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span>Views by Country</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    {Object.entries(stats.charts?.viewsByCountry || {}).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(stats.charts?.viewsByCountry || {})
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 10)
                          .map(([country, count]) => {
                            const maxCount = Math.max(...Object.values(stats.charts?.viewsByCountry || {}) as number[])
                            const percentage = ((count as number) / maxCount) * 100
                            return (
                              <div key={country} className="">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs sm:text-sm text-slate-700">{country}</span>
                                  <span className="text-xs sm:text-sm font-medium text-slate-900">{count}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-4 text-sm">No location data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span>Top Referrers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    {Object.entries(stats.charts?.viewsByReferrer || {}).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(stats.charts?.viewsByReferrer || {})
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 10)
                          .map(([referrer, count]) => {
                            const maxCount = Math.max(...Object.values(stats.charts?.viewsByReferrer || {}) as number[])
                            const percentage = ((count as number) / maxCount) * 100
                            return (
                              <div key={referrer} className="">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs sm:text-sm text-slate-700 truncate mr-2">{referrer}</span>
                                  <span className="text-xs sm:text-sm font-medium text-slate-900">{count}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-4 text-sm">No referrer data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
