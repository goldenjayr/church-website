"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, BookOpen, GripVertical } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getDoctrines, deleteDoctrine } from "@/lib/doctrine-actions"
import { LoginForm } from "@/components/admin/login-form"
import { AdminNavigation } from "@/components/admin/admin-navigation"
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

export default function AdminDoctrinesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctrines, setDoctrines] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser && currentUser.role === "ADMIN") {
        const doctrinesToSet = await getDoctrines()
        setDoctrines(doctrinesToSet)
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

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteDoctrine(id)
      if (result.success) {
        toast.success("Doctrine deleted successfully!")
        setDoctrines(prev => prev.filter(doctrine => doctrine.id !== id))
      } else {
        toast.error(result.error || "Failed to delete doctrine")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the doctrine")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDoctrines = doctrines.filter((doctrine) => {
    const matchesSearch =
      doctrine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctrine.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Doctrines</h1>
              <p className="text-slate-600 mt-2">Manage your church doctrines and beliefs</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/admin/doctrines/new")}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Doctrine
            </Button>
          </div>

          {/* Search */}
          <Card className="border-none shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search doctrines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctrines Grid */}
          <div className="grid gap-6">
            {filteredDoctrines.map((doctrine, index) => (
              <motion.div
                key={doctrine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{doctrine.title}</h3>
                          <p className="text-slate-600 mb-4 line-clamp-3" 
                             dangerouslySetInnerHTML={{ __html: doctrine.content.substring(0, 200) + "..." }} 
                          />
                          <div className="flex items-center space-x-3">
                            <Badge variant={doctrine.published ? "default" : "secondary"}>
                              {doctrine.published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline">{doctrine.category}</Badge>
                            <span className="text-sm text-slate-500">Order: {doctrine.order}</span>
                            <span className="text-sm text-slate-500">
                              {new Date(doctrine.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => router.push(`/admin/doctrines/${doctrine.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the doctrine "{doctrine.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doctrine.id)}
                                disabled={deletingId === doctrine.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingId === doctrine.id ? "Deleting..." : "Delete"}
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

          {filteredDoctrines.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No doctrines found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? "Try adjusting your search" : "Start by creating your first doctrine"}
              </p>
              {!searchTerm && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/admin/doctrines/new")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Doctrine
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}