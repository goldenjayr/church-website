"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, FileText, Tag, Filter, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getBlogPosts } from "@/lib/blog-actions"
import { getBlogCategories } from "@/lib/blog-category-actions"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { MultiSelect, Option } from "@/components/ui/multi-select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteBlogPost } from "@/lib/blog-actions"
import { toast } from "sonner"

export default function AdminBlogPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([])
  const [selectedTags, setSelectedTags] = useState<Option[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<Option[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN") {
        const [posts, categoriesData] = await Promise.all([
          getBlogPosts(),
          getBlogCategories()
        ])
        setBlogPosts(posts)
        setCategories(categoriesData.filter((cat: any) => cat.active))

        const allTags = posts.flatMap((post: any) => post.tags || [])
        const uniqueTags = [...new Set(allTags)].sort()
        const tagOptions: Option[] = uniqueTags.map(tag => ({
          value: tag,
          label: tag
        }))
        setAvailableTags(tagOptions)
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

  const categoryOptions = useMemo(() =>
    categories.map(cat => ({
      value: cat.id,
      label: cat.name,
    })), [categories])

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())

    const selectedCategoryValues = selectedCategories.map(c => c.label);
    const matchesCategory = selectedCategories.length === 0 || selectedCategoryValues.includes(post.category?.name)

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(selectedTag => post.tags?.includes(selectedTag.value))

    return matchesSearch && matchesCategory && matchesTags
  })

  const handleDeletePost = async (id: string) => {
    if (!id) return
    setDeletingId(id)
    try {
      const result = await deleteBlogPost(id as string)

      if (result.success) {
        toast.success("Blog post deleted successfully!")
        setBlogPosts(prev => prev.filter(post => post.id !== id))
      } else {
        toast.error(result.error || "Failed to delete blog post")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the blog post")
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Blog Posts</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Manage your church blog content</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 transition-all duration-200 text-sm sm:text-base justify-center"
                onClick={() => router.push("/admin/blog/stats")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </Button>
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200 text-sm sm:text-base justify-center"
                onClick={() => router.push("/admin/blog/categories")}
              >
                <Tag className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Manage Categories</span>
                <span className="sm:hidden">Categories</span>
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:hover:scale-105 border-0 text-sm sm:text-base justify-center"
                onClick={() => router.push("/admin/blog/new")}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="font-semibold">New Post</span>
              </Button>
            </div>
          </div>

          {/* Filters - Mobile optimized */}
          <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 mb-6 sm:mb-8 sm:hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="md:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 transition-all duration-200 w-full"
                    />
                  </div>
                </div>

                {/* Categories - Mobile optimized */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                    <label className="text-xs sm:text-sm font-medium text-slate-700">Categories</label>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-slate-500 hover:text-slate-700 p-1 h-auto"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <MultiSelect
                    options={categoryOptions}
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    placeholder="Select categories..."
                    className="w-full"
                  />
                </div>

                {/* Tags - Mobile optimized */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                    <label className="text-xs sm:text-sm font-medium text-slate-700">Filter by Tags</label>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTags([])}
                        className="text-xs text-slate-500 hover:text-slate-700 p-1 h-auto"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <MultiSelect
                    options={availableTags}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Select tags to filter..."
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Grid - Mobile optimized */}
          <div className="grid gap-4 sm:gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center gap-3 mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-2">{post.title}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                              By {post.authorName || post.author?.name || 'Unknown Author'} • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 line-clamp-2">{post.excerpt || 'No excerpt available'}</p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant={post.published ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
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
                          {post.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{post.tags.length - 2}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          title="Preview Post"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                          onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this blog post.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-red-600 hover:bg-red-700">
                                {deletingId === post.id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No posts found</h3>
              <p className="text-slate-500">
                {searchTerm || selectedCategories.length > 0 || selectedTags.length > 0
                  ? "Try adjusting your search or filters"
                  : "No blog posts available"}
              </p>
              {(selectedCategories.length > 0 || selectedTags.length > 0) && (
                <div className="mt-4 flex gap-2 justify-center">
                  {selectedCategories.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategories([])}
                      className="text-xs"
                    >
                      Clear Category Filters
                    </Button>
                  )}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-xs"
                    >
                      Clear Tag Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
