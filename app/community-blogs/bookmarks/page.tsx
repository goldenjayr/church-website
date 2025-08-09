"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageSquare,
  Eye,
  Search,
  Home,
  Newspaper,
  X,
  Bookmark,
  BookmarkCheck,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Tag,
} from "lucide-react"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"
import { getBlogPostUrl } from "@/lib/combined-blog-utils"
import { getCurrentUser } from "@/lib/auth-actions"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BookmarksPage() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const router = useRouter()

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterAndSortBookmarks()
  }, [bookmarks, searchQuery, filterType, sortBy])

  const initializeData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)
      await loadBookmarks()
    } catch (error) {
      console.error("Error initializing:", error)
      toast.error("Failed to load bookmarks")
    } finally {
      setLoading(false)
    }
  }

  const loadBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      const data = await response.json()

      if (response.ok && data.bookmarks) {
        setBookmarks(data.bookmarks)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      toast.error('Failed to load bookmarks')
    }
  }

  const filterAndSortBookmarks = () => {
    let filtered = [...bookmarks]

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(bookmark => {
        const post = bookmark.blogPost || bookmark.userBlogPost
        return post?.postType === filterType
      })
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(bookmark => {
        const post = bookmark.blogPost || bookmark.userBlogPost
        return post?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post?.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post?.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      })
    }

    // Sort
    filtered.sort((a, b) => {
      const postA = a.blogPost || a.userBlogPost
      const postB = b.blogPost || b.userBlogPost
      
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title":
          return postA.title.localeCompare(postB.title)
        case "mostViewed":
          return (postB.viewCount || 0) - (postA.viewCount || 0)
        default:
          return 0
      }
    })

    setFilteredBookmarks(filtered)
  }

  const handleToggleBookmark = async (postId: string, postType: string) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          postType: postType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (!data.bookmarked) {
          // Remove from bookmarks list
          setBookmarks(prev => prev.filter(bookmark => {
            const post = bookmark.blogPost || bookmark.userBlogPost
            return post?.id !== postId
          }))
          toast.success('Removed from bookmarks')
        }
      } else {
        toast.error(data.error || 'Failed to update bookmark')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark')
    }
  }

  const formatPostDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/community-blogs')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blogs
              </Button>
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-800">My Saved Posts</h1>
                <Badge className="bg-blue-100 text-blue-700">
                  {bookmarks.length}
                </Badge>
              </div>
            </div>
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search saved posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter by Type */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="church">Church Posts</SelectItem>
                <SelectItem value="community">Community Posts</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="mostViewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filters */}
          {(searchQuery || filterType !== "all") && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-slate-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {filterType !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filterType === "church" ? "Church" : "Community"}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilterType("all")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBookmarks.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bookmark className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {bookmarks.length === 0 ? "No saved posts yet" : "No posts match your filters"}
              </h3>
              <p className="text-slate-500 text-center mb-6 max-w-md">
                {bookmarks.length === 0 
                  ? "Start saving posts by clicking the bookmark icon on any blog post."
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              <Button
                onClick={() => router.push('/community-blogs')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Browse Blogs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => {
              const post = bookmark.blogPost || bookmark.userBlogPost
              if (!post) return null

              return (
                <Card key={bookmark.id} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden group">
                  <Link href={getBlogPostUrl(post)} className="block">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
                      {(post.coverImage || post.imageUrl) ? (
                        <img
                          src={getOptimizedImageUrl(post.coverImage || post.imageUrl, {
                            width: 600,
                            height: 400,
                            quality: "auto:good",
                            crop: "fill",
                            format: "auto"
                          })}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-16 h-16 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={post.postType === 'church' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                          {post.postType === 'church' ? '⛪ Church' : '👥 Community'}
                        </Badge>
                      </div>

                      {/* Remove Bookmark Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleToggleBookmark(post.id, post.postType)
                        }}
                        title="Remove from bookmarks"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Title */}
                      <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Author and Date */}
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={post.author?.profileImage ? getOptimizedImageUrl(post.author.profileImage, {
                              width: 48,
                              height: 48,
                              quality: "auto",
                              crop: "fill",
                              gravity: "face"
                            }) : undefined}
                          />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-green-500 text-white">
                            {post.author?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">
                            {post.author?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatPostDate(post.publishedAt || post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {post.excerpt || "No description available"}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-3 border-t text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {post.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {post._count?.likes || post.likeCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post._count?.comments || 0}
                        </span>
                        <span className="ml-auto text-xs text-slate-400">
                          Saved {formatPostDate(bookmark.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
