"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, BookOpen, GripVertical } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getDoctrines, deleteDoctrine, updateDoctrineOrders } from "@/lib/doctrine-actions"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
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
      <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 sm:hover:scale-[1.02] group">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start gap-2 sm:gap-4 flex-1">
              <div className="flex items-center gap-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing hover:bg-slate-100 p-1.5 sm:p-2 rounded-md transition-all duration-200 sm:hover:scale-110 active:scale-95"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 line-clamp-2">{doctrine.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3"
                   dangerouslySetInnerHTML={{ __html: doctrine.content.substring(0, 200) + "..." }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant={doctrine.published ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {doctrine.published ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{doctrine.category}</Badge>
                  <span className="text-xs sm:text-sm text-slate-500">Order: {doctrine.order}</span>
                  <span className="text-xs sm:text-sm text-slate-500">
                    {new Date(doctrine.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => window.open(`/doctrines`, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => router.push(`/admin/doctrines/${doctrine.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0">
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
    <AdminPageLayout user={user} onLogout={handleLogout}>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header - Mobile optimized */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Doctrines</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Manage your church doctrines and beliefs</p>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:hover:scale-105 border-0 text-sm sm:text-base justify-center"
              onClick={() => router.push("/admin/doctrines/new")}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="font-semibold">New Doctrine</span>
            </Button>
          </div>

          {/* Search - Mobile optimized */}
          <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 mb-6 sm:mb-8 sm:hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
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
              <div className="grid gap-4 sm:gap-6">
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
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => router.push("/admin/doctrines/new")}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Create First Doctrine</span>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}