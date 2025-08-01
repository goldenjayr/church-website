"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminNavigation } from "@/components/admin/admin-navigation"
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

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser && params.id) {
        const doctrine = await getDoctrine(params.id as string)
        if (doctrine) {
          setFormData({
            title: doctrine.title,
            content: doctrine.content,
            category: doctrine.category,
            order: doctrine.order,
            published: doctrine.published,
          })
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
    <div className="min-h-screen bg-slate-50">
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
                <h1 className="text-3xl font-bold text-slate-900">Edit Doctrine</h1>
                <p className="text-slate-600 mt-2">Update your doctrine</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the doctrine.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
              >
                <Eye className="w-4 h-4 mr-2" />
                {formData.published ? "Published" : "Draft"}
              </Button>
              <Button
                type="submit"
                form="doctrine-form"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Update Doctrine"}
              </Button>
            </div>
          </div>

          <form id="doctrine-form" onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Doctrine Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter doctrine title..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
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
    </div>
  )
}