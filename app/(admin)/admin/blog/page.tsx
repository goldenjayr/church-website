"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, FileText, Tag, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getBlogPosts } from "@/lib/blog-actions"
import { getBlogCategories } from "@/lib/blog-category-actions"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { MultiSelect, Option } from "@/components/ui/multi-select"
import { deleteBlogPost } from "@/lib/blog-actions"
import { toast } from "sonner"

export default function AdminBlogPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
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
        setCategories(categoriesData)

        // Extract unique tags from all posts
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

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "ALL" || post.category?.name === selectedCategory
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(selectedTag => post.tags?.includes(selectedTag.value))
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
              <p className="text-slate-600 mt-2">Manage your church blog content</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200"
                onClick={() => router.push("/admin/blog/categories")}
              >
                <Tag className="w-4 h-4 mr-2" />
                Manage Categories
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                onClick={() => router.push("/admin/blog/new")}
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-white/20 rounded-full p-1">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">New Post</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 mb-8 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div>
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

                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-700">Categories</label>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                      variant={selectedCategory === "ALL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("ALL")}
                      className={`whitespace-nowrap ${selectedCategory === "ALL" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}>
                      ALL
                    </Button>
                    {categories.filter(cat => cat.active).map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.name)}
                        className={`whitespace-nowrap ${selectedCategory === category.name ? "text-white" : ""}`}
                        style={{
                          backgroundColor: selectedCategory === category.name ? category.color : undefined,
                          borderColor: selectedCategory !== category.name ? category.color : undefined,
                          color: selectedCategory !== category.name ? category.color : undefined
                        }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-700">Filter by Tags</label>
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

          {/* Posts Grid */}
          <div className="grid gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                            <p className="text-sm text-slate-500">
                              By {post.authorName || post.author?.name || 'Unknown Author'} • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-slate-600 mb-4 line-clamp-2">{post.excerpt || 'No excerpt available'}</p>

                        <div className="flex items-center space-x-3">
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                          {post.category && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: post.category.color,
                                color: post.category.color
                              }}
                            >
                              {post.category.name}
                            </Badge>
                          )}
                          {post.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                          <div className="flex space-x-1">
                            {post.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          title="Preview Post"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                {searchTerm || selectedCategory !== "ALL" || selectedTags.length > 0
                  ? "Try adjusting your search or filters"
                  : "No blog posts available"}
              </p>
              {(selectedCategory !== "ALL" || selectedTags.length > 0) && (
                <div className="mt-4 flex gap-2 justify-center">
                  {selectedCategory !== "ALL" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory("ALL")}
                      className="text-xs"
                    >
                      Clear Category Filter
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
