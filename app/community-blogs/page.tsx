"use client"

import { useState, useEffect, useCallback, memo, useMemo, Suspense } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
  Plus,
  User,
  Tag,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  PenTool,
  Users,
  Filter,
  Home,
  Newspaper,
  X,
  LogOut,
  LayoutDashboard,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"
import { deleteUserBlogPost } from "@/lib/user-blog-actions"
import { getCombinedPopularTags } from "@/lib/combined-blog-actions"
import { getBlogPostUrl } from "@/lib/combined-blog-utils"
import { getCurrentUser, logout } from "@/lib/auth-actions"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const POSTS_PER_PAGE = 20

// Move BlogCard outside of the main component to prevent recreation
const BlogCard = memo(({
  post,
  isOwner = false,
  index = 0,
  onTagClick,
  onEdit,
  onDelete,
  isBookmarked = false,
  onToggleBookmark
}: {
  post: any;
  isOwner?: boolean;
  index?: number;
  onTagClick?: (tag: string) => void;
  onEdit?: (slug: string) => void;
  onDelete?: (id: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (postId: string, postType: string) => void;
}) => {
  const router = useRouter()
  const postUrl = getBlogPostUrl(post)
  const formatPostDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy")
  }
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click is on an interactive element
    const target = e.target as HTMLElement
    const isInteractive = 
      target.closest('button') || 
      target.closest('a') || 
      target.closest('[role="button"]')
    
    // If not clicking on an interactive element, navigate to the post
    if (!isInteractive) {
      router.push(postUrl)
    }
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card 
        className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden group cursor-pointer relative"
        onClick={handleCardClick}
      >
          {/* Image Section */}
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

            {/* Badges */}
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

          {/* Content Section */}
          <div className="flex flex-col flex-grow p-4 space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-base md:text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Author and Date */}
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
                  {post.author?.name?.[0] || (post.postType === 'church' ? 'C' : 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-slate-600">
                <span className="font-medium">
                  {post.author?.name || 'Anonymous'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">
                  {formatPostDate(post.publishedAt || post.createdAt)}
                </span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-sm text-slate-600 flex-grow">
              {post.excerpt ? (
                post.excerpt.length > 150
                  ? `${post.excerpt.substring(0, 150)}...`
                  : post.excerpt
              ) : (
                "No description available"
              )}
            </p>

            {/* Tags */}
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
                      onTagClick?.(tag)
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

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-1 border-t mt-auto">
              <Link href={postUrl} className="flex items-center gap-3 text-xs text-slate-500">
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
              </Link>
              <div className="flex items-center gap-1">
                {/* Bookmark button */}
                <motion.button
                  className={`h-7 w-7 p-0 rounded-md hover:bg-slate-50 flex items-center justify-center relative ${isBookmarked ? 'text-blue-600' : 'text-slate-500'} hover:text-blue-700 transition-colors`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggleBookmark?.(post.id, post.postType)
                  }}
                  title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {isBookmarked ? (
                      <motion.div
                        key="bookmarked"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="not-bookmarked"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Sparkle effect when bookmarking */}
                  <AnimatePresence>
                    {isBookmarked && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={`sparkle-${i}`}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            initial={{ 
                              scale: 0,
                              x: 0,
                              y: 0,
                              opacity: 1
                            }}
                            animate={{ 
                              scale: [0, 1.5, 0],
                              x: [0, (Math.cos(i * 60 * Math.PI / 180) * 20)],
                              y: [0, (Math.sin(i * 60 * Math.PI / 180) * 20)],
                              opacity: [1, 0.8, 0]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ 
                              duration: 0.6,
                              ease: "easeOut",
                              delay: i * 0.05
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.button>
                {isOwner && post.postType === 'community' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onEdit?.(post.slug)
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
                        onDelete?.(post.id)
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
      </Card>
    </motion.div>
  )
})
BlogCard.displayName = 'BlogCard'

function CommunityBlogsContent() {
  const [user, setUser] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)

  // Pagination states
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize user and tags on mount
  useEffect(() => {
    initializeData()
  }, [])

  // Handle tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'my' && user) {
      setActiveTab('my')
    }
  }, [searchParams, user])

  // Reset and reload when filters change
  useEffect(() => {
    if (!initialLoading) {
      setPosts([])
      setPage(1)
      setHasMore(true)
      loadPosts(1, true, searchQuery, activeTab, selectedTags)
    }
  }, [activeTab, selectedTags])

  const initializeData = async () => {
    try {
      const [currentUser, tags] = await Promise.all([
        getCurrentUser(),
        getCombinedPopularTags()
      ])

      setUser(currentUser)
      setPopularTags(tags)

      // Load initial posts, passing the current user to ensure bookmarks are loaded
      await loadPosts(1, true, undefined, undefined, undefined, currentUser)
      
      // Then load bookmarks separately for the sidebar, passing the user explicitly
      if (currentUser) {
        await loadBookmarks(currentUser)
      }
    } catch (error) {
      console.error("Error initializing:", error)
      toast.error("Failed to load initial data")
    } finally {
      setInitialLoading(false)
    }
  }

  const loadPosts = async (
    pageNum: number,
    reset: boolean = false,
    query?: string,
    tab?: string,
    tags?: string[],
    currentUser?: any // Pass user explicitly to avoid timing issues
  ) => {
    if (loadingMore && !reset) return

    setLoadingMore(true)
    if (reset) {
      setIsSearching(true)
    }

    try {
      // Use passed parameters or current state
      const searchParams = query !== undefined ? query : searchQuery
      const activeType = tab !== undefined ? tab : activeTab
      const activeTags = tags !== undefined ? tags : selectedTags

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: POSTS_PER_PAGE.toString(),
        type: activeType,
        ...(searchParams && { q: searchParams }),
        ...(activeTags.length > 0 && { tags: activeTags.join(',') })
      })

      const response = await fetch(`/api/blogs/search?${params}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      if (reset) {
        setPosts(data.posts)
        setPage(1)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }

      // Update bookmarked posts if the API provides bookmark info
      // Use the passed user or the state user
      const activeUser = currentUser || user
      if (activeUser && data.bookmarkedIds !== undefined) {
        // Always update bookmarks from the API since it's the source of truth
        setBookmarkedPosts(new Set(data.bookmarkedIds))
      }

      setHasMore(data.pagination.hasMore)
      setTotalCount(data.pagination.totalCount)

      if (!reset) {
        setPage(pageNum)
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      toast.error("Failed to load blog posts")
    } finally {
      setLoadingMore(false)
      setIsSearching(false)
    }
  }

  const resetAndSearch = useCallback((query?: string, tab?: string, tags?: string[]) => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    loadPosts(1, true, query, tab, tags)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput !== searchQuery) {
      setSearchQuery(searchInput)
      resetAndSearch(searchInput, activeTab, selectedTags)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(e as any)
    }
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1)
    }
  }, [page, loadingMore, hasMore])

  const observerTarget = useInfiniteScroll({
    loading: loadingMore,
    hasMore,
    onLoadMore: loadMore,
    threshold: 200
  })

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const clearFilters = () => {
    setSearchQuery("")
    setSearchInput("")
    setSelectedTags([])
    resetAndSearch("", activeTab, [])
  }

  const handleDelete = async () => {
    if (!deletePostId) return

    const result = await deleteUserBlogPost(deletePostId)
    if (result.success) {
      toast.success("Blog post deleted successfully")
      setPosts(prev => prev.filter(post => post.id !== deletePostId))
      setTotalCount(prev => prev - 1)
      setDeletePostId(null)
    } else {
      toast.error(result.error || "Failed to delete blog post")
    }
  }

  // Memoized callbacks for BlogCard actions
  const handleEditPost = useCallback((slug: string) => {
    router.push(`/community-blogs/${slug}/edit`)
  }, [router])

  const handleDeletePost = useCallback((id: string) => {
    setDeletePostId(id)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.role === "ADMIN" ? "/admin" : "/dashboard"
  }

  const getDashboardLabel = () => {
    if (!user) return "Dashboard"
    return user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"
  }

  // Load user's bookmarks
  const loadBookmarks = async (currentUser?: any) => {
    const activeUser = currentUser || user
    if (!activeUser) {
      return
    }

    setLoadingBookmarks(true)
    try {
      const response = await fetch('/api/bookmarks?limit=100', {
        credentials: 'include' // Ensure cookies are sent
      })
      const data = await response.json()

      if (response.ok && data.bookmarks && Array.isArray(data.bookmarks)) {
        // Create a set of bookmarked post IDs for quick lookup
        const bookmarkedIds = new Set<string>()
        const savedPostsList: any[] = []
        
        data.bookmarks.forEach((bookmark: any) => {
          // The API returns bookmarks with all necessary fields
          if (bookmark && bookmark.id) {
            bookmarkedIds.add(bookmark.id)
            // Ensure all required fields are present
            const processedBookmark = {
              ...bookmark,
              title: bookmark.title || 'Untitled',
              postType: bookmark.postType || 'community',
              slug: bookmark.slug || bookmark.id // Fallback to ID if no slug
            }
            savedPostsList.push(processedBookmark)
          }
        })
        
        setBookmarkedPosts(bookmarkedIds)
        setSavedPosts(savedPostsList)
      } else {
        setBookmarkedPosts(new Set())
        setSavedPosts([])
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      setBookmarkedPosts(new Set())
      setSavedPosts([])
    } finally {
      setLoadingBookmarks(false)
    }
  }

  // Toggle bookmark for a post
  const handleToggleBookmark = useCallback(async (postId: string, postType: string) => {
    if (!user) {
      toast.error('Please sign in to bookmark posts')
      return
    }

    try {
      const requestBody = {
        postId,
        postType: postType,
      }
      
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.isBookmarked) {
          // Add to bookmarks
          setBookmarkedPosts(prev => new Set([...prev, postId]))
          toast.success('Added to bookmarks')
        } else {
          // Remove from bookmarks
          setBookmarkedPosts(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
          toast.success('Removed from bookmarks')
        }

        // Reload saved posts for sidebar
        if (user) {
          await loadBookmarks(user)
        }
      } else {
        toast.error(data.error || 'Failed to update bookmark')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark')
    }
  }, [user, bookmarkedPosts])

  if (initialLoading) {
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left section - Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/community-blogs" className="flex items-center gap-2 group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
                  <Newspaper className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-lg text-slate-800 hidden sm:inline">Blogs</span>
              </Link>
            </div>

            {/* Center section - Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto px-4">
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    placeholder="Search blogs..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-32 h-11 rounded-full border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm placeholder:text-slate-400"
                  />
                  {searchInput && (
                    <button
                      type="button"
                        onClick={() => {
                          setSearchInput('')
                          if (searchQuery) {
                            setSearchQuery('')
                            resetAndSearch("", activeTab, selectedTags)
                          }
                        }}
                      className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <span className="hidden sm:inline">Search</span>
                    )}
                    {!isSearching && (
                      <Search className="w-4 h-4 sm:hidden" />
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </Link>

              {user ? (
                <>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                    asChild
                  >
                    <Link href="/community-blogs/new">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 90, 0] }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.div>
                        <span className="hidden md:inline">Write</span>
                      </motion.div>
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-slate-100 hover:ring-blue-200 transition-all duration-200">
                          <AvatarImage
                            src={user.profileImage ? getOptimizedImageUrl(user.profileImage, {
                              width: 72,
                              height: 72,
                              quality: "auto",
                              crop: "fill",
                              gravity: "face"
                            }) : undefined}
                            alt={user.name || 'User'}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.name || "Member"}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardLink()} className="flex items-center cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {getDashboardLabel()}
                        </Link>
                      </DropdownMenuItem>
                      {user.role === "USER" && (
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm rounded-full px-4 py-2"
                  asChild
                >
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
                <span className="hidden sm:inline">{totalCount} Blogs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-[88px] space-y-4">
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
                    All Blogs
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
                      My Blogs
                    </button>
                  )}
                </div>
              </div>


              {/* Saved Posts */}
              {user && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-blue-600" />
                    Saved Posts
                    {savedPosts.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        {savedPosts.length}
                      </span>
                    )}
                  </h3>
                  <style jsx>{`
                    /* Custom scrollbar styles */
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: #f1f5f9;
                      border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 3px;
                      transition: background 0.2s;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: #94a3b8;
                    }
                    /* Firefox */
                    .custom-scrollbar {
                      scrollbar-width: thin;
                      scrollbar-color: #cbd5e1 #f1f5f9;
                    }
                  `}</style>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                    {loadingBookmarks ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : savedPosts.length > 0 ? (
                      savedPosts.map((post: any) => {
                        if (!post) return null
                        return (
                          <Link
                            key={post.id}
                            href={getBlogPostUrl(post)}
                            className="block group"
                          >
                            <div className="px-2.5 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-100 group">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-700 group-hover:text-blue-700 line-clamp-2 leading-relaxed">
                                    {post.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    by {post.author?.name || 'Anonymous'}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 flex-shrink-0"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleToggleBookmark(post.id, post.postType)
                                  }}
                                  title="Remove from bookmarks"
                                >
                                  <X className="w-3 h-3 text-slate-400 hover:text-red-500 transition-colors" />
                                </Button>
                              </div>
                            </div>
                          </Link>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Bookmark className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-600">
                          No saved posts yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Click the bookmark icon on any post to save it for later
                        </p>
                      </div>
                    )}
                  </div>
                  {savedPosts.length > 10 && (
                    <Link
                      href="/community-blogs/bookmarks"
                      className="block text-center pt-3 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium border-t border-slate-100 transition-colors"
                    >
                      View all {savedPosts.length} saved posts →
                    </Link>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              {user && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
                    >
                      <Link href="/community-blogs/new" className="flex items-center justify-center">
                        <motion.div
                          className="flex items-center"
                          initial={{ x: 0 }}
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <motion.div
                            className="mr-2"
                            animate={{ 
                              rotate: 0,
                              scale: 1
                            }}
                            whileHover={{ 
                              rotate: 180,
                              scale: 1.2
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Plus className="w-4 h-4" />
                          </motion.div>
                          <span className="font-medium">Write New Blog</span>
                        </motion.div>
                        <motion.div
                          className="ml-2 opacity-0 group-hover:opacity-100"
                          initial={{ x: -10 }}
                          animate={{ x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PenTool className="w-3.5 h-3.5" />
                        </motion.div>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Improved Tag Filter Bar */}
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 relative">
                <div className="flex items-center gap-3">
                  {/* All filter chip */}
                  <button
                    onClick={() => {
                      setSelectedTags([])
                      // Immediately search with no tags
                      resetAndSearch(searchQuery, activeTab, [])
                    }}
                    className={`
                      px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 shadow-sm
                      ${selectedTags.length === 0
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md"
                      }
                    `}
                  >
                    ✨ All
                  </button>

                  {/* Left scroll arrow */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('tag-scroll-container')
                      if (container) {
                        container.scrollBy({ left: -200, behavior: 'smooth' })
                      }
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {/* Scrollable tags container with gradient fade edges */}
                  <div className="relative flex-1 overflow-hidden">
                    {/* Left gradient fade */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    {/* Right gradient fade */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div
                      id="tag-scroll-container"
                      className="overflow-x-auto scrollbar-hide scroll-smooth"
                    >
                      <div className="flex items-center gap-2 px-1">
                        {popularTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(selectedTags.filter(t => t !== tag))
                              } else {
                                setSelectedTags([tag])
                              }
                            }}
                            className={`
                              px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 shadow-sm
                              ${selectedTags.includes(tag)
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200"
                                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md"
                              }
                            `}
                          >
                            {selectedTags.includes(tag) && "✓ "}{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right scroll arrow */}
                  <button
                    onClick={() => {
                      const container = document.getElementById('tag-scroll-container')
                      if (container) {
                        container.scrollBy({ left: 200, behavior: 'smooth' })
                      }
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {/* Clear filters button (only show when filters active) */}
                  {(selectedTags.length > 0 || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="flex-shrink-0 px-3 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 text-sm font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Show active search query if exists */}
              {searchQuery && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-blue-50 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>Showing results for <span className="font-semibold text-blue-700">"{searchQuery}"</span></span>
                </div>
              )}
            </div>

            {isSearching && posts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <Card className="border-none shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Newspaper className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No blogs found</h3>
                  <p className="text-slate-500 text-center mb-6">
                    {searchQuery || selectedTags.length > 0
                      ? "Try adjusting your search or filters"
                      : activeTab === "my"
                      ? "You haven't written any blogs yet"
                      : "Be the first to share your story with the community!"}
                  </p>
                  {user && !searchQuery && selectedTags.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        asChild 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                      >
                        <Link href="/community-blogs/new" className="flex items-center">
                          <motion.div
                            animate={{ 
                              rotate: [0, 0, 360, 360],
                              scale: [1, 1.2, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                              times: [0, 0.2, 0.8, 1]
                            }}
                            className="mr-2"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.div>
                          <span className="font-medium">Create Your First Blog</span>
                          <motion.div
                            className="ml-2"
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              x: [0, 3, 0]
                            }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {posts.map((post, index) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      index={index % POSTS_PER_PAGE}
                      isOwner={user?.id === post.authorId}
                      isBookmarked={bookmarkedPosts.has(post.id)}
                      onTagClick={toggleTag}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-slate-600">Loading more posts...</span>
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="h-px bg-slate-200 w-12"></div>
                      <p>You've reached the end</p>
                      <div className="h-px bg-slate-200 w-12"></div>
                    </div>
                  )}
                </div>
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

export default function OptimizedPublicBlogsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CommunityBlogsContent />
    </Suspense>
  )
}
