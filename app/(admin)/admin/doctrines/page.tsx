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
import { getDoctrines, deleteDoctrine, updateDoctrineOrders } from "@/lib/doctrine-actions"
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableDoctrineItemProps {
  doctrine: any
  index: number
  router: any
  deletingId: string | null
  handleDelete: (id: string) => void
}

function SortableDoctrineItem({ doctrine, index, router, deletingId, handleDelete }: SortableDoctrineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doctrine.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex items-center space-x-2">
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing hover:bg-slate-100 p-2 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </div>
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

            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                onClick={() => window.open(`/doctrines`, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                onClick={() => router.push(`/admin/doctrines/${doctrine.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200">
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
  )
}

export default function AdminDoctrinesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctrines, setDoctrines] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id) {
      const oldIndex = doctrines.findIndex((doctrine) => doctrine.id === active.id)
      const newIndex = doctrines.findIndex((doctrine) => doctrine.id === over?.id)
      
      const newDoctrines = arrayMove(doctrines, oldIndex, newIndex)
      setDoctrines(newDoctrines)
      
      // Update the order in the database
      const doctrineIds = newDoctrines.map(doctrine => doctrine.id)
      const result = await updateDoctrineOrders(doctrineIds)
      
      if (!result.success) {
        toast.error("Failed to update doctrine order")
        // Revert on error
        setDoctrines(doctrines)
      } else {
        toast.success("Doctrine order updated!")
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
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
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              onClick={() => router.push("/admin/doctrines/new")}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 rounded-full p-1">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-semibold">New Doctrine</span>
              </div>
            </Button>
          </div>

          {/* Search */}
          <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 mb-8 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search doctrines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctrines Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredDoctrines.map(doctrine => doctrine.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-6">
                {filteredDoctrines.map((doctrine, index) => (
                  <SortableDoctrineItem
                    key={doctrine.id}
                    doctrine={doctrine}
                    index={index}
                    router={router}
                    deletingId={deletingId}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="transform rotate-3 opacity-90">
                  <SortableDoctrineItem
                    doctrine={doctrines.find(doctrine => doctrine.id === activeId)!}
                    index={0}
                    router={router}
                    deletingId={deletingId}
                    handleDelete={handleDelete}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {filteredDoctrines.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No doctrines found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? "Try adjusting your search" : "Start by creating your first doctrine"}
              </p>
              {!searchTerm && (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => router.push("/admin/doctrines/new")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 rounded-full p-1">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">Create First Doctrine</span>
                  </div>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}