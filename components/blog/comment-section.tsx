"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  MessageCircle,
  Heart,
  Reply,
  MoreVertical,
  Edit2,
  Trash2,
  Flag,
  Pin,
  PinOff,
  Shield,
  Send,
  User,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  createComment,
  editComment,
  deleteComment,
  toggleCommentLike,
  reportComment,
  togglePinComment,
  getComments,
} from "@/lib/comment-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import { User as UserType } from "@prisma/client"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  userId: string
  parentId: string | null
  isEdited: boolean
  editedAt: Date | null
  likes: number
  isPinned: boolean
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  replies?: Comment[]
  commentLikes?: Array<{ userId: string }>
}

interface CommentSectionProps {
  blogPostId: string
  blogPostSlug: string
}

interface CommentItemProps {
  comment: Comment
  isReply?: boolean
  currentUser: UserType | null
  expandedReplies: Set<string>
  replyingTo: string | null
  replyContent: string
  editingComment: string | null
  editContent: string
  submitting: boolean
  onReplyClick: (commentId: string) => void
  onReplySubmit: (parentId: string) => void
  onReplyCancel: () => void
  onEditClick: (commentId: string, content: string) => void
  onEditSubmit: (commentId: string) => void
  onEditCancel: () => void
  onDeleteClick: (commentId: string) => void
  onLikeClick: (commentId: string) => void
  onReportClick: (commentId: string) => void
  onPinClick: (commentId: string) => void
  onToggleReplies: (commentId: string) => void
  onReplyContentChange: (content: string) => void
  onEditContentChange: (content: string) => void
}

export function CommentSection({ blogPostId, blogPostSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [commentToReport, setCommentToReport] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  // Fetch current user and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, commentsResult] = await Promise.all([
          getCurrentUser(),
          getComments(blogPostId),
        ])
        
        setCurrentUser(user)
        if (commentsResult.success && commentsResult.comments) {
          setComments(commentsResult.comments as Comment[])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load comments")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [blogPostId])

  const handleSubmitComment = async () => {
    if (!currentUser) {
      toast.error("Please log in to comment")
      return
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    setSubmitting(true)
    try {
      const result = await createComment(blogPostId, newComment)
      if (result.success && result.comment) {
        // Add the new comment with empty commentLikes array to prevent undefined
        const newCommentWithDefaults = {
          ...result.comment,
          commentLikes: [],
          replies: []
        } as Comment
        setComments([newCommentWithDefaults, ...comments])
        setNewComment("")
        toast.success("Comment posted successfully")
      } else {
        toast.error(result.error || "Failed to post comment")
      }
    } catch (error) {
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!currentUser) {
      toast.error("Please log in to reply")
      return
    }

    if (!replyContent.trim()) {
      toast.error("Please enter a reply")
      return
    }

    setSubmitting(true)
    try {
      const result = await createComment(blogPostId, replyContent, parentId)
      if (result.success && result.comment) {
        // Add the reply to the parent comment without refetching everything
        const newReply = {
          ...result.comment,
          commentLikes: [],
          replies: []
        } as Comment
        
        const updatedComments = comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            }
          }
          return comment
        })
        
        setComments(updatedComments)
        setReplyContent("")
        setReplyingTo(null)
        // Expand the replies to show the new one
        setExpandedReplies(prev => new Set([...prev, parentId]))
        toast.success("Reply posted successfully")
      } else {
        toast.error(result.error || "Failed to post reply")
      }
    } catch (error) {
      toast.error("Failed to post reply")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Please enter content")
      return
    }

    setSubmitting(true)
    try {
      const result = await editComment(commentId, editContent)
      if (result.success && result.comment) {
        // Update the comment locally without refetching
        const updateCommentInTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                content: editContent.trim(),
                isEdited: true,
                editedAt: new Date()
              }
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateCommentInTree(comment.replies)
              }
            }
            return comment
          })
        }
        
        setComments(updateCommentInTree(comments))
        setEditingComment(null)
        setEditContent("")
        toast.success("Comment updated successfully")
      } else {
        toast.error(result.error || "Failed to update comment")
      }
    } catch (error) {
      toast.error("Failed to update comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async () => {
    if (!commentToDelete) return

    setSubmitting(true)
    try {
      const result = await deleteComment(commentToDelete)
      if (result.success) {
        // Remove the comment locally without refetching
        const removeCommentFromTree = (comments: Comment[]): Comment[] => {
          return comments
            .filter(comment => comment.id !== commentToDelete)
            .map(comment => {
              if (comment.replies) {
                return {
                  ...comment,
                  replies: removeCommentFromTree(comment.replies)
                }
              }
              return comment
            })
        }
        
        setComments(removeCommentFromTree(comments))
        toast.success("Comment deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete comment")
      }
    } catch (error) {
      toast.error("Failed to delete comment")
    } finally {
      setSubmitting(false)
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      toast.error("Please log in to like comments")
      return
    }

    try {
      const result = await toggleCommentLike(commentId)
      if (result.success) {
        // Update likes locally without refetching
        const updateLikesInTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const isCurrentlyLiked = comment.commentLikes?.some(like => like.userId === currentUser.id)
              return {
                ...comment,
                likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1,
                commentLikes: isCurrentlyLiked
                  ? comment.commentLikes?.filter(like => like.userId !== currentUser.id)
                  : [...(comment.commentLikes || []), { userId: currentUser.id }]
              }
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateLikesInTree(comment.replies)
              }
            }
            return comment
          })
        }
        
        setComments(updateLikesInTree(comments))
      } else {
        toast.error(result.error || "Failed to update like")
      }
    } catch (error) {
      toast.error("Failed to update like")
    }
  }

  const handleReportComment = async () => {
    if (!commentToReport || !reportReason) {
      toast.error("Please select a reason for reporting")
      return
    }

    setSubmitting(true)
    try {
      const result = await reportComment(commentToReport, reportReason)
      if (result.success) {
        toast.success("Comment reported successfully")
      } else {
        toast.error(result.error || "Failed to report comment")
      }
    } catch (error) {
      toast.error("Failed to report comment")
    } finally {
      setSubmitting(false)
      setReportDialogOpen(false)
      setCommentToReport(null)
      setReportReason("")
    }
  }

  const handlePinComment = async (commentId: string) => {
    try {
      const result = await togglePinComment(commentId)
      if (result.success) {
        // Refresh comments
        const commentsResult = await getComments(blogPostId)
        if (commentsResult.success && commentsResult.comments) {
          setComments(commentsResult.comments as Comment[])
        }
        toast.success(result.isPinned ? "Comment pinned" : "Comment unpinned")
      } else {
        toast.error(result.error || "Failed to update pin status")
      }
    } catch (error) {
      toast.error("Failed to update pin status")
    }
  }

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedReplies(newExpanded)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isAuthor = currentUser?.id === comment.userId
    const isAdmin = currentUser?.role === "ADMIN"
    const isLiked = comment.commentLikes?.some(like => like.userId === currentUser?.id) || false
    const hasReplies = comment.replies && comment.replies.length > 0
    const areRepliesExpanded = expandedReplies.has(comment.id)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${isReply ? "ml-12" : ""}`}
      >
        <div className={`flex gap-3 ${comment.isPinned && !isReply ? "bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg" : ""}`}>
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              {comment.user.name
                ? comment.user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                : comment.user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {comment.user.name || "Anonymous"}
                  </span>
                  {comment.user.role === "ADMIN" && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {comment.isPinned && !isReply && (
                    <Badge variant="default" className="text-xs bg-blue-600">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-muted-foreground italic">(edited)</span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(isAuthor || isAdmin) && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingComment(comment.id)
                          setEditContent(comment.content)
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCommentToDelete(comment.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && !isReply && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePinComment(comment.id)}>
                        {comment.isPinned ? (
                          <>
                            <PinOff className="mr-2 h-4 w-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-4 w-4" />
                            Pin comment
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isAuthor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setCommentToReport(comment.id)
                          setReportDialogOpen(true)
                        }}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Edit your comment..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={submitting}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null)
                      setEditContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => handleLikeComment(comment.id)}
              >
                <Heart
                  className={`h-4 w-4 mr-1 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span className="text-xs">{comment.likes}</span>
              </Button>

              {!isReply && currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setReplyingTo(comment.id)
                    setReplyContent("")
                  }}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleReplies(comment.id)}
                >
                  {areRepliesExpanded ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs">
                    {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
                  </span>
                </Button>
              )}
            </div>

            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-3"
              >
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {hasReplies && areRepliesExpanded && (
              <div className="mt-4 space-y-4">
                {comment.replies!.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  {currentUser.name
                    ? currentUser.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                    : currentUser.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <User className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Please log in to join the discussion
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment) => (
              <div key={comment.id}>
                <CommentItem comment={comment} />
                {comments.indexOf(comment) < comments.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                setCommentToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteComment}
              disabled={submitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Why are you reporting this comment?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {["Spam", "Inappropriate", "Offensive", "Misleading", "Other"].map((reason) => (
              <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason.toLowerCase()}
                  checked={reportReason === reason.toLowerCase()}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-blue-600"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportDialogOpen(false)
                setCommentToReport(null)
                setReportReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportComment}
              disabled={!reportReason || submitting}
            >
              Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
