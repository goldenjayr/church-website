"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, GripVertical, Tag, ArrowLeft } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getBlogCategories, deleteBlogCategory, updateBlogCategoryOrders } from "@/lib/blog-category-actions"
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

interface SortableCategoryItemProps {
  category: any
  index: number
  router: any
  deletingId: string | null
  handleDelete: (id: string) => void
}

function SortableCategoryItem({ category, index, router, deletingId, handleDelete }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

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
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                >
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 line-clamp-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm sm:text-base text-slate-600 mb-3 line-clamp-2">{category.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant={category.active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {category.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    {category._count.blogPosts} posts
                  </Badge>
                  <span className="text-xs sm:text-sm text-slate-500">Order: {category.order}</span>
                  <span className="text-xs sm:text-sm text-slate-500 hidden sm:inline">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => router.push(`/admin/blog/categories/${category.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the category \"{category.name}\".
                      {category._count.blogPosts > 0 && (
                        <span className="block mt-2 text-red-600 font-medium">
                          Warning: This category has {category._count.blogPosts} blog post(s) using it.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id}
                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    >
                      {deletingId === category.id ? "Deleting..." : "Delete"}
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

export default function BlogCategoriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<any[]>([])
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
        const categoriesToSet = await getBlogCategories()
        setCategories(categoriesToSet)
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
      const result = await deleteBlogCategory(id)
      if (result.success) {
        toast.success("Category deleted successfully!")
        setCategories(prev => prev.filter(category => category.id !== id))
      } else {
        toast.error(result.error || "Failed to delete category")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the category")
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
      const oldIndex = categories.findIndex((category) => category.id === active.id)
      const newIndex = categories.findIndex((category) => category.id === over?.id)

      const newCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(newCategories)

      // Update the order in the database
      const categoryIds = newCategories.map(category => category.id)
      const result = await updateBlogCategoryOrders(categoryIds)

      if (!result.success) {
        toast.error("Failed to update category order")
        // Revert on error
        setCategories(categories)
      } else {
        toast.success("Category order updated!")
      }
    }
  }

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Mobile-optimized header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Blog Categories</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Manage your blog post categories</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto justify-center border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => router.push("/admin/blog")}
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
                <Button
                  className="w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:hover:scale-105 border-0 text-xs sm:text-sm"
                  onClick={() => router.push("/admin/blog/categories/new")}
                  size="sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="font-semibold">New Category</span>
                </Button>
              </div>
            </div>

            {/* Search */}
            <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50 mb-6 sm:mb-8 sm:hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Grid */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredCategories.map(category => category.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid gap-4 sm:gap-6">
                  {filteredCategories.map((category, index) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
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
                    <SortableCategoryItem
                      category={categories.find(cat => cat.id === activeId)!}
                      index={0}
                      router={router}
                      deletingId={deletingId}
                      handleDelete={handleDelete}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">No categories found</h3>
                <p className="text-sm sm:text-base text-slate-500 mb-4">
                  {searchTerm ? "Try adjusting your search" : "Start by creating your first category"}
                </p>
                {!searchTerm && (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:hover:scale-105 border-0 text-xs sm:text-sm"
                    onClick={() => router.push("/admin/blog/categories/new")}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="font-semibold">Create First Category</span>
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </AdminPageLayout>

  )
}