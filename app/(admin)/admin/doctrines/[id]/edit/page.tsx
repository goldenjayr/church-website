"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { getDoctrine, updateDoctrine, deleteDoctrine } from "@/lib/doctrine-actions"
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

export default function EditDoctrinePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    order: 0,
    published: true,
  })

  const [originalData, setOriginalData] = useState({
    title: "",
    content: "",
    category: "",
    order: 0,
    published: true,
  })

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && params.id) {
        const doctrine = await getDoctrine(params.id as string)
        if (doctrine) {
          const doctrineData = {
            title: doctrine.title,
            content: doctrine.content,
            category: doctrine.category,
            order: doctrine.order,
            published: doctrine.published,
          }
          setFormData(doctrineData)
          setOriginalData(doctrineData)
        } else {
          toast.error("Doctrine not found")
          router.push("/admin/doctrines")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !params.id) return

    setSaving(true)
    try {
      const result = await updateDoctrine({
        id: params.id as string,
        ...formData,
      })

      if (result.success) {
        toast.success("Doctrine updated successfully!")
        router.push("/admin/doctrines")
      } else {
        toast.error(result.error || "Failed to update doctrine")
      }
    } catch (error) {
      toast.error("An error occurred while updating the doctrine")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!params.id) return

    setDeleting(true)
    try {
      const result = await deleteDoctrine(params.id as string)

      if (result.success) {
        toast.success("Doctrine deleted successfully!")
        router.push("/admin/doctrines")
      } else {
        toast.error(result.error || "Failed to delete doctrine")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the doctrine")
    } finally {
      setDeleting(false)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Edit Doctrine</h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Update your doctrine</p>
                </div>
              </div>
              
              {/* Action buttons - responsive grid on mobile */}
              <div className="grid grid-cols-2 sm:flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
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
                        This action cannot be undone. This will permanently delete the doctrine.
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
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
                  className="text-xs sm:text-sm"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                  {formData.published ? "Published" : "Draft"}
                </Button>
                <Button
                  type="submit"
                  form="doctrine-form"
                  disabled={saving || !hasChanges()}
                  className={`col-span-2 sm:col-span-1 justify-center text-xs sm:text-sm transition-all duration-300 ${hasChanges()
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
                  ) : hasChanges() ? "Update Doctrine" : "No Changes"}
                </Button>
              </div>
            </div>
          </div>

          <form id="doctrine-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 sm:hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Doctrine Details</span>
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
                    placeholder="Enter doctrine title..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                      placeholder="e.g., Core Beliefs, Practices, etc."
                      required
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
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 sm:hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Content <span className="text-red-500">*</span></span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Start writing your doctrine content..."
                />
              </CardContent>
            </Card>
          </form>
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}