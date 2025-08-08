"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
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
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { createBlogPost } from "@/lib/blog-actions"
import { getBlogCategories } from "@/lib/blog-category-actions"
import { getActiveMembers } from "@/lib/member-actions"
import { toast } from "sonner"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    metaDescription: "",
    imageUrl: "",
    published: false,
    featured: false,
    categoryId: "",
    authorName: "",
    memberId: "",
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const [currentUser, categoriesData, membersData] = await Promise.all([
        getCurrentUser(),
        getBlogCategories(),
        getActiveMembers()
      ])
      setUser(currentUser)
      setCategories(categoriesData.filter(cat => cat.active))
      setMembers(membersData)
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
        memberId: formData.memberId === "none" ? undefined : formData.memberId,
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
    <AdminPageLayout user={user} onLogout={handleLogout} >
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Mobile-optimized header */}
          <div className="mb-6 sm:mb-8">
            {/* Back button and title section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 w-fit -ml-2 sm:ml-0"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">New Blog Post</h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Create a new blog post for your church</p>
                </div>
              </div>
              
              {/* Action buttons - stacked on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
                  className="w-full sm:w-auto justify-center"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {formData.published ? "Published" : "Draft"}
                </Button>
                <Button
                  type="submit"
                  form="blog-post-form"
                  disabled={saving || !formData.title.trim() || !formData.content.trim() || (!formData.authorName.trim() && !formData.memberId.trim())}
                  className={`w-full sm:w-auto justify-center text-white font-medium transition-all duration-300 ${formData.title.trim() && formData.content.trim()
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-400 cursor-not-allowed opacity-60"
                  }`}
                  size="sm"
                >
                  <Save className={`w-4 h-4 mr-2 text-white transition-transform duration-300 ${formData.title.trim() && formData.content.trim() ? "rotate-0" : "rotate-12"
                    }`} />
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      <span className="text-white">Saving...</span>
                    </>
                  ) : (
                    <span className="text-white">Save Post</span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <form id="blog-post-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 sm:hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Post Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div>
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
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

                <div>
                  <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                  <div className="space-y-3">
                    <Select
                      value={formData.memberId}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        memberId: value,
                        authorName: value === "none" ? prev.authorName : ""
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a member as author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use account name ({user?.name || 'N/A'})</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-2">
                                <span>{member.firstName} {member.lastName}</span>
                                {member.position && (
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white"
                                    style={{ backgroundColor: member.position.color }}
                                  >
                                    {member.position.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {(!formData.memberId || formData.memberId === "none") && (
                      <div>
                        <Label htmlFor="authorName">Or enter custom author name</Label>
                        <Input
                          id="authorName"
                          value={formData.authorName}
                          onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                          placeholder="Custom author name..."
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a member or enter a custom name. If neither is provided, your account name will be used.
                  </p>
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
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addTag}
                      className="w-full sm:w-auto"
                      size="sm"
                    >
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                        <span className="text-xs sm:text-sm">{tag}</span>
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
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

            <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 sm:hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Content <span className="text-red-500">*</span></span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
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
    </AdminPageLayout>
  )
}