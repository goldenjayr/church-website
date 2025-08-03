"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Users, Star, Mail, Phone, FileText, Crown } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { getMembers, deleteMember, toggleMemberStatus } from "@/lib/member-actions"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MembersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [members, setMembers] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser && currentUser.role === "ADMIN") {
        const membersData = await getMembers()
        setMembers(membersData)
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
      const result = await deleteMember(id)
      if (result.success) {
        toast.success("Member deleted successfully!")
        setMembers(prev => prev.filter(member => member.id !== id))
      } else {
        toast.error(result.error || "Failed to delete member")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the member")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleMemberStatus(id)
      if (result.success) {
        setMembers(prev => prev.map(member => 
          member.id === id ? result.member : member
        ))
        toast.success("Member status updated!")
      } else {
        toast.error(result.error || "Failed to update member status")
      }
    } catch (error) {
      toast.error("An error occurred while updating member status")
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getUniquePositions = () => {
    const positions = members
      .filter(member => member.position)
      .map(member => member.position)
      .reduce((unique: any[], position) => {
        if (!unique.find(p => p.id === position.id)) {
          unique.push(position)
        }
        return unique
      }, [])
    return positions.sort((a, b) => a.order - b.order)
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && member.active) ||
      (statusFilter === "inactive" && !member.active) ||
      (statusFilter === "featured" && member.featured)
    
    const matchesPosition = positionFilter === "all" || 
      (positionFilter === "none" && !member.position) ||
      member.position?.id === positionFilter

    return matchesSearch && matchesStatus && matchesPosition
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
              <h1 className="text-3xl font-bold text-slate-900">Members</h1>
              <p className="text-slate-600 mt-2">Manage church members and their information</p>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              onClick={() => router.push("/admin/members/new")}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 rounded-full p-1">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-semibold">New Member</span>
              </div>
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 mb-8 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200 w-full"
                    />
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Position</label>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        <SelectItem value="none">No Position</SelectItem>
                        {getUniquePositions().map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: position.color }}
                              />
                              <span>{position.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-600 rounded-full">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Members</p>
                    <p className="text-2xl font-bold text-blue-900">{members.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-600 rounded-full">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Members</p>
                    <p className="text-2xl font-bold text-green-900">
                      {members.filter(m => m.active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-yellow-600 rounded-full">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Featured</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {members.filter(m => m.featured).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-600 rounded-full">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">With Positions</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {members.filter(m => m.position).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header Section */}
                    <div className="relative p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                      {member.featured && (
                        <div className="absolute top-4 right-4">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 truncate">
                            {member.firstName} {member.lastName}
                          </h3>
                          
                          {member.position && (
                            <Badge 
                              className="mt-1 text-white border-0"
                              style={{ backgroundColor: member.position.color }}
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              {member.position.name}
                            </Badge>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={member.active ? "default" : "secondary"}>
                              {member.active ? "Active" : "Inactive"}
                            </Badge>
                            {member._count.authoredPosts > 0 && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {member._count.authoredPosts} posts
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      {member.bio && (
                        <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                          {member.bio}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2">
                        {member.email && (
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Join Date */}
                      <div className="text-xs text-slate-400">
                        Joined: {new Date(member.joinDate).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(member.id)}
                          className="text-xs"
                        >
                          {member.active ? "Deactivate" : "Activate"}
                        </Button>

                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => router.push(`/admin/members/${member.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete "{member.firstName} {member.lastName}".
                                  {member._count.authoredPosts > 0 && (
                                    <span className="block mt-2 text-red-600 font-medium">
                                      Warning: This member has authored {member._count.authoredPosts} blog post(s).
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(member.id)}
                                  disabled={deletingId === member.id}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deletingId === member.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No members found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== "all" || positionFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start by adding your first member"}
              </p>
              {!searchTerm && statusFilter === "all" && positionFilter === "all" && (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={() => router.push("/admin/members/new")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 rounded-full p-1">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">Add First Member</span>
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