"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  MessageSquare,
  Eye,
  Search,
  Plus,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  ChevronLeft,
  Sparkles,
  BookOpen,
  PenTool,
  Users,
  Filter,
  Home,
  Newspaper,
  Loader2,
} from "lucide-react"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"
import {
  deleteUserBlogPost
} from "@/lib/user-blog-actions"
import { getCombinedPopularTags } from "@/lib/combined-blog-actions"
import { getBlogPostUrl } from "@/lib/combined-blog-utils"
import { getCurrentUser } from "@/lib/auth-actions"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PublicBlogsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allPosts, setAllPosts] = useState<any[]>([]) // Store all posts for client-side filtering
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("") // Separate input state for debouncing
  const [selectedTags, setSelectedTags] = useState<string[]>([]) // Multiple tags selection
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [dataLoaded, setDataLoaded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load data only once on mount
  useEffect(() => {
    if (!dataLoaded) {
      loadData()
      setDataLoaded(true)
    }
  }, [])

  // Handle tab parameter separately
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'my' && user) {
      setActiveTab('my')
    }
  }, [searchParams, user])

  const loadData = async () => {
    try {
      // Check if user is logged in (optional for public blogs)
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      const [fetchedPosts, tags] = await Promise.all([
        getOptimizedCombinedBlogPosts(), // Load both community and church blogs optimized
        getCombinedPopularTags() // Load combined tags from both sources
      ])

      setAllPosts(fetchedPosts) // Store all posts for client-side filtering
      setPopularTags(tags)

      // Only load user's posts if logged in
      if (currentUser) {
        const userPosts = await getUserBlogPosts(currentUser.id)
        setMyPosts(userPosts)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timer)
  }, [searchInput])

  // Client-side filtering when search or tags change
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      )
    }

    // Filter by selected tags (OR logic - posts with any of the selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post =>
        post.tags && post.tags.some((tag: string) => selectedTags.includes(tag))
      )
    }

    return filtered
  }, [allPosts, searchQuery, selectedTags])

  // Use filteredPosts directly instead of copying to posts state
  const displayPosts = activeTab === 'all' ? filteredPosts : myPosts

  const handleSearch = () => {
    // Search is now handled automatically through the effect
    // This function can be used for explicit search button clicks if needed
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSearchInput("")
    setSelectedTags([])
  }

  const handleDelete = async () => {
    if (!deletePostId) return

    const result = await deleteUserBlogPost(deletePostId)
    if (result.success) {
      toast.success("Blog post deleted successfully")
      // Also remove from allPosts if it exists there
      setAllPosts(prev => prev.filter(post => post.id !== deletePostId))
      setMyPosts(myPosts.filter(post => post.id !== deletePostId))
      setDeletePostId(null)
    } else {
      toast.error(result.error || "Failed to delete blog post")
    }
  }

  const formatPostDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy")
  }

  const BlogCard = memo(({ post, isOwner = false, index = 0 }: { post: any; isOwner?: boolean; index?: number }) => {
    const postUrl = getBlogPostUrl(post)
    
    return (
      <motion.div 
        className="h-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <Link href={postUrl} className="block h-full">
          <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden group cursor-pointer">
            {/* Image Section - Fixed Height */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex-shrink-0">
              {(post.coverImage || post.imageUrl) ? (
                <>
                  <img
                    src={getOptimizedImageUrl(post.coverImage || post.imageUrl, {
                      width: 800,
                      height: 400,
                      quality: "auto:best",
                      crop: "fill",
                      format: "auto"
                    })}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Newspaper className="w-16 h-16 text-slate-300" />
                </div>
              )}

              {/* Badges on Image */}
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                <div className="flex flex-wrap gap-1">
                  {post.category && post.postType === 'church' && (
                    <Badge
                      className="shadow-sm"
                      style={{
                        backgroundColor: post.category.color || '#3b82f6',
                        color: 'white'
                      }}
                    >
                      {post.category.name}
                    </Badge>
                  )}
                </div>
                {!post.published && isOwner && post.postType === 'community' && (
                  <Badge className="bg-yellow-500 text-white shadow-sm">
                    Draft
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Section - Flex Grow */}
            <div className="flex flex-col flex-grow p-4 space-y-3">
              {/* Title - Natural height with line clamp */}
              <h3 className="font-semibold text-base md:text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h3>

              {/* Author and Date Section - Natural flow */}
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="w-6 h-6 flex-shrink-0">
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
                    {post.author?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-slate-600">
                  <span className="font-medium">
                    {post.author?.name || (post.postType === 'church' ? 'Church Admin' : 'Anonymous')}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    {formatPostDate(post.publishedAt || post.createdAt)}
                  </span>
                </div>
              </div>

              {/* Excerpt - Natural height with max character limit */}
              <p className="text-sm text-slate-600 flex-grow">
                {post.excerpt ? (
                  post.excerpt.length > 150
                    ? `${post.excerpt.substring(0, 150)}...`
                    : post.excerpt
                ) : (
                  "No description available"
                )}
              </p>

              {/* Tags Section - Natural flow */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleTag(tag)
                      }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats and Actions Section - Always at Bottom */}
              <div className="flex items-center justify-between pt-3 border-t mt-auto">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.viewCount || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{post._count?.likes || post.likeCount || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post._count?.comments || 0}</span>
                  </span>
                </div>
                {isOwner && post.postType === 'community' && (
                  <div className="flex items-center gap-1 relative z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        router.push(`/community-blogs/${post.slug}/edit`)
                      }}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeletePostId(post.id)
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    )
  })

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
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <div className="w-px h-6 bg-slate-300" />
              <div className="flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-xl text-slate-800">Community Blogs</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                <Home className="w-5 h-5" />
              </Link>
              {user && (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    asChild
                  >
                    <Link href="/community-blogs/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Write a Blog
                    </Link>
                  </Button>
                  <div className="w-px h-6 bg-slate-300" />
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.profileImage ? getOptimizedImageUrl(user.profileImage, {
                          width: 64,
                          height: 64,
                          quality: "auto",
                          crop: "fill",
                          gravity: "face"
                        }) : undefined}
                        alt={user.name || 'User'}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700">{user.name || 'User'}</span>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Minimal Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Community & Church Blog Platform</h1>
              <span className="text-sm opacity-90 hidden md:inline">Stories from our community and church family</span>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{displayPosts.length} Blogs</span>
              </div>
              {user && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <PenTool className="w-4 h-4" />
                  <span className="hidden sm:inline">{myPosts.length} Your Blogs</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Fixed Width */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-[88px] space-y-4">
              {/* Search Section */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-sm mb-3">Search Blogs</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                  {searchQuery && (
                    <div className="text-xs text-slate-500">
                      Showing results for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Options */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === "all"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    All Blogs ({filteredPosts.length})
                  </button>
                  {user && (
                    <button
                      onClick={() => setActiveTab("my")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeTab === "my"
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      My Blogs ({myPosts.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Popular Tags */}
              {popularTags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className={`cursor-pointer text-xs transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {(selectedTags.length > 0 || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full text-xs"
                      onClick={clearFilters}
                    >
                      Clear Filters ({selectedTags.length > 0 ? `${selectedTags.length} tags` : ''} {searchQuery ? 'search' : ''})
                    </Button>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              {user && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/community-blogs/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Write New Blog
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === "all" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">All Community & Church Blogs</h2>
                  <p className="text-slate-600 mt-1">Discover stories and insights from our community and church family</p>
                </div>

                {displayPosts.length === 0 ? (
                  <Card className="border-none shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Newspaper className="w-16 h-16 text-slate-300 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">No blogs found</h3>
                      <p className="text-slate-500 text-center mb-6">
                        Be the first to share your story with the community!
                      </p>
                      {user ? (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/community-blogs/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Blog
                  </Link>
                </Button>
                      ) : (
                        <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                          <Link href="/login">
                            <User className="w-4 h-4 mr-2" />
                            Sign In to Write
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {displayPosts.map((post, index) => (
                      <BlogCard key={`${post.id}-${post.title}`} post={post} index={index} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Your Blog Posts</h2>
                    <p className="text-slate-600 mt-1">Manage and create your blog content</p>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/community-blogs/new">
                      <Plus className="w-4 h-4 mr-2" />
                      New Blog
                    </Link>
                  </Button>
                </div>

                {myPosts.length === 0 ? (
                  <Card className="border-none shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <PenTool className="w-16 h-16 text-slate-300 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">You haven't written any blogs yet</h3>
                      <p className="text-slate-500 text-center mb-6">
                        Start sharing your thoughts and experiences with the community
                      </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/community-blogs/new">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Write Your First Blog
                  </Link>
                </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {myPosts.map((post, index) => (
                      <BlogCard key={`${post.id}-${post.title}`} post={post} isOwner={true} index={index} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
