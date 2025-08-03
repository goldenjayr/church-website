"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, GripVertical, Users, Crown } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getPositions, deletePosition, updatePositionOrders } from "@/lib/position-actions"
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

interface SortablePositionItemProps {
  position: any
  index: number
  router: any
  deletingId: string | null
  handleDelete: (id: string) => void
}

function SortablePositionItem({ position, index, router, deletingId, handleDelete }: SortablePositionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: position.id })

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
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: position.color || '#3b82f6' }}
                >
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{position.name}</h3>
                {position.description && (
                  <p className="text-slate-600 mb-3">{position.description}</p>
                )}
                <div className="flex items-center space-x-3">
                  <Badge variant={position.active ? "default" : "secondary"}>
                    {position.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {position._count.members} members
                  </Badge>
                  <span className="text-sm text-slate-500">Order: {position.order}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(position.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                onClick={() => router.push(`/admin/positions/${position.id}/edit`)}
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
                      This action cannot be undone. This will permanently delete the position "{position.name}".
                      {position._count.members > 0 && (
                        <span className="block mt-2 text-red-600 font-medium">
                          Warning: This position has {position._count.members} member(s) assigned to it.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(position.id)}
                      disabled={deletingId === position.id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deletingId === position.id ? "Deleting..." : "Delete"}
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

export default function PositionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [positions, setPositions] = useState<any[]>([])
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
        const positionsData = await getPositions()
        setPositions(positionsData)
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
      const result = await deletePosition(id)
      if (result.success) {
        toast.success("Position deleted successfully!")
        setPositions(prev => prev.filter(position => position.id !== id))
      } else {
        toast.error(result.error || "Failed to delete position")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the position")
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
      const oldIndex = positions.findIndex((position) => position.id === active.id)
      const newIndex = positions.findIndex((position) => position.id === over?.id)
      
      const newPositions = arrayMove(positions, oldIndex, newIndex)
      setPositions(newPositions)
      
      // Update the order in the database
      const positionIds = newPositions.map(position => position.id)
      const result = await updatePositionOrders(positionIds)
      
      if (!result.success) {
        toast.error("Failed to update position order")
        // Revert on error
        setPositions(positions)
      } else {
        toast.success("Position order updated!")
      }
    }
  }

  const filteredPositions = positions.filter((position) => {
    const matchesSearch = position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (position.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Positions</h1>
              <p className="text-slate-600 mt-2">Manage church positions and roles</p>
            </div>
            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              onClick={() => router.push("/admin/positions/new")}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 rounded-full p-1">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-semibold">New Position</span>
              </div>
            </Button>
          </div>

          {/* Search */}
          <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 mb-8 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Positions Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredPositions.map(position => position.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-6">
                {filteredPositions.map((position, index) => (
                  <SortablePositionItem
                    key={position.id}
                    position={position}
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
                  <SortablePositionItem
                    position={positions.find(pos => pos.id === activeId)!}
                    index={0}
                    router={router}
                    deletingId={deletingId}
                    handleDelete={handleDelete}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {filteredPositions.length === 0 && (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No positions found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? "Try adjusting your search" : "Start by creating your first position"}
              </p>
              {!searchTerm && (
                <Button
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => router.push("/admin/positions/new")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 rounded-full p-1">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">Create First Position</span>
                  </div>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}