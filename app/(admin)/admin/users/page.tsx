"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  User, 
  Trash2, 
  Key,
  Calendar,
  FileText,
  TrendingUp,
  UserPlus,
  Mail,
  Clock,
  Edit
} from "lucide-react"
import { getAllUsers, deleteUser, updateUserRole, getUserStats } from "@/lib/user-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import type { User as UserType } from "@prisma/client"
import { toast } from "@/hooks/use-toast"

type UserWithCount = {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "USER"
  createdAt: Date
  updatedAt: Date
  _count: {
    blogPosts: number
    events: number
  }
}

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserWithCount[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithCount[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserWithCount | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const loadData = async () => {
    const [user, allUsers, stats] = await Promise.all([
      getCurrentUser(),
      getAllUsers(),
      getUserStats()
    ])
    
    if (!user || user.role !== "ADMIN") {
      router.push("/admin")
      return
    }
    
    setCurrentUser(user)
    setUsers(allUsers)
    setUserStats(stats)
    setLoading(false)
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    const result = await updateUserRole(userId, newRole)
    
    if (result.success) {
      toast({
        title: "Role Updated",
        description: `User role changed to ${newRole}`,
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const result = await deleteUser(selectedUser.id)
    
    if (result.success) {
      toast({
        title: "User Deleted",
        description: "User has been removed from the system",
      })
      setShowDeleteDialog(false)
      setSelectedUser(null)
      loadData()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <AdminPageLayout user={currentUser} onLogout={handleLogout}>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header - Mobile optimized */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
              Manage registered users and their permissions
            </p>
          </div>

          {/* Stats Cards - Mobile optimized */}
          {userStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className="border-none shadow-md sm:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">Total</Badge>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{userStats.totalUsers}</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Registered Users</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md sm:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">Admins</Badge>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{userStats.adminCount}</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Admin Users</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md sm:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">Regular</Badge>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{userStats.userCount}</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Regular Users</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md sm:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">Growth</Badge>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">+{userStats.growth}</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Table - Mobile optimized */}
          <Card className="border-none shadow-md sm:shadow-lg">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl">All Users</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              {/* Mobile View - Cards */}
              <div className="block sm:hidden">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border-b border-slate-200 p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">
                            {user.name || "No name"}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {user.id !== currentUser.id && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(
                                  user.id, 
                                  user.role === "ADMIN" ? "USER" : "ADMIN"
                                )}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                              </DropdownMenuItem>
                              
                              {user._count.blogPosts === 0 && user._count.events === 0 && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowDeleteDialog(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(user.email)
                              toast({
                                title: "Copied",
                                description: "Email copied to clipboard",
                              })
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <Badge 
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className={`${user.role === "ADMIN" ? "bg-purple-600" : ""} text-xs`}
                      >
                        {user.role === "ADMIN" && <Shield className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {user._count.blogPosts}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user._count.events}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-medium">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {user.name || "No name"}
                              </p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                            className={user.role === "ADMIN" ? "bg-purple-600" : ""}
                          >
                            {user.role === "ADMIN" && <Shield className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {user._count.blogPosts} posts
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {user._count.events} events
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {user.id !== currentUser.id && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(
                                      user.id, 
                                      user.role === "ADMIN" ? "USER" : "ADMIN"
                                    )}
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                                  </DropdownMenuItem>
                                  
                                  {user._count.blogPosts === 0 && user._count.events === 0 && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setShowDeleteDialog(true)
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(user.email)
                                  toast({
                                    title: "Copied",
                                    description: "Email copied to clipboard",
                                  })
                                }}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Copy Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    {searchTerm ? "No users found matching your search" : "No users registered yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Signups - Mobile optimized */}
          {userStats && userStats.recentUsers.length > 0 && (
            <Card className="border-none shadow-md sm:shadow-lg mt-6 sm:mt-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStats.recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name || "No name"}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </AdminPageLayout>
  )
}
