"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Shield,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Search,
  Eye,
  Trash2,
  Heart,
  Reply,
  Clock,
  User,
  FileText,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { moderateComment, deleteComment } from "@/lib/comment-actions"
import type { CommentStatus } from "@prisma/client"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface CommentWithRelations {
  id: string
  content: string
  status: CommentStatus
  isPinned: boolean
  likes: number
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  blogPost: {
    id: string
    title: string
    slug: string
  }
  reports: Array<{
    id: string
    reason: string
    description: string | null
    createdAt: Date
    user: {
      name: string | null
      email: string
    }
  }>
  _count: {
    replies: number
    commentLikes: number
  }
}

interface Stats {
  total: number
  pending: number
  flagged: number
  reports: number
}

interface CommentsManagementProps {
  initialComments: CommentWithRelations[]
  initialStats: Stats
}

export function CommentsManagement({ initialComments, initialStats }: CommentsManagementProps) {
  const [comments, setComments] = useState(initialComments)
  const [filteredComments, setFilteredComments] = useState(initialComments)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedComment, setSelectedComment] = useState<CommentWithRelations | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState(initialStats)
  const [refreshing, setRefreshing] = useState(false)

  // Filter comments based on tab and search
  const filterComments = (tab: string, query: string) => {
    let filtered = comments

    // Filter by status/tab
    switch (tab) {
      case "pending":
        filtered = comments.filter(c => c.status === "PENDING")
        break
      case "flagged":
        filtered = comments.filter(c => c.status === "FLAGGED")
        break
      case "approved":
        filtered = comments.filter(c => c.status === "APPROVED")
        break
      case "rejected":
        filtered = comments.filter(c => c.status === "REJECTED")
        break
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        c =>
          c.content.toLowerCase().includes(query.toLowerCase()) ||
          c.user.name?.toLowerCase().includes(query.toLowerCase()) ||
          c.user.email.toLowerCase().includes(query.toLowerCase()) ||
          c.blogPost.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    setFilteredComments(filtered)
  }

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    filterComments(tab, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterComments(selectedTab, query)
  }

  const handleModerate = async (commentId: string, status: CommentStatus) => {
    setSubmitting(true)
    try {
      const result = await moderateComment(commentId, status)
      if (result.success) {
        // Update local state
        const updatedComments = comments.map(c =>
          c.id === commentId ? { ...c, status } : c
        )
        setComments(updatedComments)
        filterComments(selectedTab, searchQuery)

        // Update stats
        const newStats = { ...stats }
        const oldComment = comments.find(c => c.id === commentId)
        
        if (oldComment) {
          if (oldComment.status === "PENDING") newStats.pending--
          if (oldComment.status === "FLAGGED") newStats.flagged--
        }
        
        if (status === "PENDING") newStats.pending++
        if (status === "FLAGGED") newStats.flagged++
        
        setStats(newStats)

        toast.success(`Comment ${status.toLowerCase()} successfully`)
      } else {
        toast.error(result.error || "Failed to moderate comment")
      }
    } catch (error) {
      toast.error("Failed to moderate comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedComment) return

    setSubmitting(true)
    try {
      const result = await deleteComment(selectedComment.id)
      if (result.success) {
        // Update local state
        const updatedComments = comments.filter(c => c.id !== selectedComment.id)
        setComments(updatedComments)
        filterComments(selectedTab, searchQuery)

        // Update stats
        const newStats = { ...stats }
        newStats.total--
        if (selectedComment.status === "PENDING") newStats.pending--
        if (selectedComment.status === "FLAGGED") newStats.flagged--
        setStats(newStats)

        toast.success("Comment deleted successfully")
        setDeleteDialogOpen(false)
        setSelectedComment(null)
      } else {
        toast.error(result.error || "Failed to delete comment")
      }
    } catch (error) {
      toast.error("Failed to delete comment")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: CommentStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "FLAGGED":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Flag className="w-3 h-3 mr-1" />
            Flagged
          </Badge>
        )
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "AN"
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Comments Management</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Moderate and manage blog comments</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          disabled={refreshing}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Mobile optimized with gradient backgrounds */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-blue-800">Total Comments</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                {stats.pending > 0 && (
                  <Badge className="bg-yellow-500 text-white text-xs px-2 py-0.5">
                    Action needed
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-yellow-800">Pending Review</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-orange-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <Flag className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-orange-800">Flagged</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-900 mt-1">{stats.flagged}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-none shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                {stats.reports > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                    Review
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-red-800">Reports</p>
              <p className="text-xl sm:text-2xl font-bold text-red-900 mt-1">{stats.reports}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Comments Management Card - Mobile optimized */}
      <Card className="border-none shadow-md sm:shadow-xl bg-gradient-to-r from-white to-slate-50">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">All Comments</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500">Manage and moderate user feedback</p>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 sm:pt-0">
          <Tabs value={selectedTab} onValueChange={handleTabChange}>
            <div className="w-full overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-3 sm:flex h-auto p-1 gap-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:text-xs sm:data-[state=active]:text-sm">
                  <span className="truncate">All ({comments.length})</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm data-[state=active]:text-xs sm:data-[state=active]:text-sm">
                  <span className="truncate">Pending ({stats.pending})</span>
                </TabsTrigger>
                <TabsTrigger value="flagged" className="text-xs sm:text-sm data-[state=active]:text-xs sm:data-[state=active]:text-sm">
                  <span className="truncate">Flagged ({stats.flagged})</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs sm:text-sm data-[state=active]:text-xs sm:data-[state=active]:text-sm">
                  <span className="truncate">Approved</span>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs sm:text-sm data-[state=active]:text-xs sm:data-[state=active]:text-sm">
                  <span className="truncate">Rejected</span>
                </TabsTrigger>
                <div className="sm:hidden"></div>
              </TabsList>
            </div>

            <TabsContent value={selectedTab}>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-4">
                {filteredComments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments found
                  </div>
                ) : (
                  filteredComments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="space-y-3">
                        {/* Author and Date */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                {getInitials(comment.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{comment.user.name || "Anonymous"}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedComment(comment)
                                  setViewDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {comment.status !== "APPROVED" && (
                                <DropdownMenuItem
                                  onClick={() => handleModerate(comment.id, "APPROVED")}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {comment.status !== "REJECTED" && (
                                <DropdownMenuItem
                                  onClick={() => handleModerate(comment.id, "REJECTED")}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              {comment.status !== "FLAGGED" && (
                                <DropdownMenuItem
                                  onClick={() => handleModerate(comment.id, "FLAGGED")}
                                >
                                  <Flag className="mr-2 h-4 w-4 text-orange-600" />
                                  Flag
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedComment(comment)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Status and Blog Post */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(comment.status)}
                          {comment.isPinned && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                        </div>

                        {/* Blog Post Link */}
                        <Link
                          href={`/blog/${comment.blogPost.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline block truncate"
                        >
                          <FileText className="w-3 h-3 inline mr-1" />
                          {comment.blogPost.title}
                        </Link>

                        {/* Comment Content */}
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {comment.content}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {comment._count.commentLikes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            {comment._count.replies}
                          </span>
                          {comment.reports.length > 0 && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <Flag className="w-3 h-3" />
                              {comment.reports.length} reports
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comment</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Blog Post</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No comments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComments.map((comment) => (
                        <TableRow key={comment.id}>
                          <TableCell className="max-w-xs">
                            <p className="truncate">{comment.content}</p>
                            {comment.isPinned && (
                              <Badge variant="outline" className="mt-1">
                                <Shield className="w-3 h-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{comment.user.name || "Anonymous"}</p>
                              <p className="text-muted-foreground">{comment.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/blog/${comment.blogPost.slug}`}
                              target="_blank"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {comment.blogPost.title}
                            </Link>
                          </TableCell>
                          <TableCell>{getStatusBadge(comment.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {comment._count.commentLikes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Reply className="w-3 h-3" />
                                {comment._count.replies}
                              </span>
                              {comment.reports.length > 0 && (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <Flag className="w-3 h-3" />
                                  {comment.reports.length}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedComment(comment)
                                    setViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {comment.status !== "APPROVED" && (
                                  <DropdownMenuItem
                                    onClick={() => handleModerate(comment.id, "APPROVED")}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                )}
                                {comment.status !== "REJECTED" && (
                                  <DropdownMenuItem
                                    onClick={() => handleModerate(comment.id, "REJECTED")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                )}
                                {comment.status !== "FLAGGED" && (
                                  <DropdownMenuItem
                                    onClick={() => handleModerate(comment.id, "FLAGGED")}
                                  >
                                    <Flag className="mr-2 h-4 w-4 text-orange-600" />
                                    Flag
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedComment(comment)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedComment.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Author</h4>
                  <p className="text-sm">{selectedComment.user.name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">{selectedComment.user.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Blog Post</h4>
                  <Link
                    href={`/blog/${selectedComment.blogPost.slug}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedComment.blogPost.title}
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                {getStatusBadge(selectedComment.status)}
              </div>

              {selectedComment.reports.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Reports ({selectedComment.reports.length})</h4>
                  <div className="space-y-2">
                    {selectedComment.reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{report.reason}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By: {report.user.name || report.user.email}
                        </p>
                        {report.description && (
                          <p className="text-sm mt-1">{report.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSelectedComment(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
