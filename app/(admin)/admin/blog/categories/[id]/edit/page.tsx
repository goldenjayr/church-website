"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Trash2, Palette } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { getBlogCategory, updateBlogCategory, deleteBlogCategory } from "@/lib/blog-category-actions"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CATEGORY_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#eab308"
]

export default function EditBlogCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: CATEGORY_COLORS[0],
    order: 0,
    active: true,
  })

  const [originalData, setOriginalData] = useState({
    name: "",
    slug: "",
    description: "",
    color: CATEGORY_COLORS[0],
    order: 0,
    active: true,
  })

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && params.id) {
        const category = await getBlogCategory(params.id as string)
        if (category) {
          const categoryData = {
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            color: category.color || CATEGORY_COLORS[0],
            order: category.order,
            active: category.active,
          }
          setFormData(categoryData)
          setOriginalData(categoryData)
        } else {
          toast.error("Category not found")
          router.push("/admin/blog/categories")
        }
      }

      setLoading(false)
    }

    loadData()
  }, [params.id, router])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(originalData.name) ? generateSlug(name) : prev.slug
    }))
  }

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !params.id) return

    setSaving(true)
    try {
      const result = await updateBlogCategory({
        id: params.id as string,
        ...formData,
      })

      if (result.success) {
        toast.success("Category updated successfully!")
        router.push("/admin/blog/categories")
      } else {
        toast.error(result.error || "Failed to update category")
      }
    } catch (error) {
      toast.error("An error occurred while updating the category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!params.id) return

    setDeleting(true)
    try {
      const result = await deleteBlogCategory(params.id as string)

      if (result.success) {
        toast.success("Category deleted successfully!")
        router.push("/admin/blog/categories")
      } else {
        toast.error(result.error || "Failed to delete category")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the category")
    } finally {
      setDeleting(false)
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Edit Category</h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Update your blog category</p>
                </div>
              </div>
              
              {/* Action buttons - responsive layout */}
              <div className="flex flex-col sm:flex-row gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto justify-center text-red-600 hover:text-red-700 text-xs sm:text-sm"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the category.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="submit"
                  form="category-form"
                  disabled={saving || !hasChanges()}
                  className={`w-full sm:w-auto justify-center text-xs sm:text-sm transition-all duration-300 ${hasChanges()
                    ? "bg-green-600 hover:bg-green-700 sm:scale-105 shadow-lg"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
                  size="sm"
                >
                  <Save className={`w-4 h-4 mr-1 sm:mr-2 transition-transform duration-300 ${hasChanges() ? "rotate-0" : "rotate-12"
                    }`} />
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1 sm:mr-2" />
                      Saving...
                    </>
                  ) : hasChanges() ? "Update Category" : "No Changes"}
                </Button>
              </div>
            </div>
          </div>

          <form id="category-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 sm:hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Category Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Enter category name..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    placeholder="category-slug"
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">URL-friendly version of the name</p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Brief description of this category..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Category Color</span>
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 mt-2">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 ${formData.color === color
                            ? "border-slate-900 scale-110 shadow-lg"
                            : "border-slate-200 hover:scale-105"
                          }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-xs sm:text-sm text-slate-600">Selected: {formData.color}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
            </Card>
          </form>
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}