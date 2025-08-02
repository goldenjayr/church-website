"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye, X } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminNavigation } from "@/components/admin/admin-navigation"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { createBlogPost } from "@/lib/blog-actions"
import { getBlogCategories } from "@/lib/blog-category-actions"
import { toast } from "sonner"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    metaDescription: "",
    imageUrl: "",
    published: false,
    featured: false,
    categoryId: "",
    tags: [] as string[],
  })
  
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const [currentUser, categoriesData] = await Promise.all([
        getCurrentUser(),
        getBlogCategories()
      ])
      setUser(currentUser)
      setCategories(categoriesData.filter(cat => cat.active))
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }))
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const result = await createBlogPost({
        ...formData,
        authorId: user.id,
      })

      if (result.success) {
        toast.success("Blog post created successfully!")
        router.push("/admin/blog")
      } else {
        toast.error(result.error || "Failed to create blog post")
      }
    } catch (error) {
      toast.error("An error occurred while creating the blog post")
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <AdminNavigation user={user} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">New Blog Post</h1>
                <p className="text-slate-600 mt-2">Create a new blog post for your church</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
              >
                <Eye className="w-4 h-4 mr-2" />
                {formData.published ? "Published" : "Draft"}
              </Button>
              <Button
                type="submit"
                form="blog-post-form"
                disabled={saving || !formData.title.trim() || !formData.content.trim()}
                className={`transition-all duration-300 ${
                  formData.title.trim() && formData.content.trim()
                    ? "bg-blue-600 hover:bg-blue-700 scale-105 shadow-lg" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                  formData.title.trim() && formData.content.trim() ? "rotate-0" : "rotate-12"
                }`} />
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : "Save Post"}
              </Button>
            </div>
          </div>

          <form id="blog-post-form" onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
                <CardTitle className="text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Post Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Brief description of the post..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Featured Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                      }
                    }}
                    placeholder="SEO description for search engines..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Start writing your blog post..."
                />
              </CardContent>
            </Card>
          </form>
        </motion.div>
      </main>
    </div>
  )
}