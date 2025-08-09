"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { MessageCircle, Send, User } from "lucide-react"
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
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"
import { CommentItem } from "./comment-item"

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
  postType?: 'church' | 'community'
}

export function CommentSection({ blogPostId, blogPostSlug, postType = 'church' }: CommentSectionProps) {
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

  // Fetch current user and comments only once on mount
  useEffect(() => {
    let mounted = true
    
    const fetchData = async () => {
      try {
        const [user, commentsResult] = await Promise.all([
          getCurrentUser(),
          getComments(blogPostId, postType),
        ])
        
        if (!mounted) return
        
        setCurrentUser(user)
        if (commentsResult.success && commentsResult.comments) {
          setComments(commentsResult.comments as Comment[])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        if (mounted) {
          toast.error("Failed to load comments")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    return () => {
      mounted = false
    }
  }, [blogPostId, postType])

  // Memoized callbacks to prevent re-renders
  const handleSubmitComment = useCallback(async () => {
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
      const result = await createComment(blogPostId, newComment, undefined, postType)
      if (result.success && result.comment) {
        const newCommentWithDefaults = {
          ...result.comment,
          commentLikes: [],
          replies: []
        } as Comment
        setComments(prev => [newCommentWithDefaults, ...prev])
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
  }, [currentUser, newComment, blogPostId, postType])

  const handleSubmitReply = useCallback(async (parentId: string) => {
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
      const result = await createComment(blogPostId, replyContent, parentId, postType)
      if (result.success && result.comment) {
        const newReply = {
          ...result.comment,
          commentLikes: [],
          replies: []
        } as Comment
        
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            }
          }
          return comment
        }))
        
        setReplyContent("")
        setReplyingTo(null)
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
  }, [currentUser, replyContent, blogPostId, postType])

  const handleEditSubmit = useCallback(async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Please enter content")
      return
    }

    setSubmitting(true)
    try {
      const result = await editComment(commentId, editContent, postType)
      if (result.success) {
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
        
        setComments(prev => updateCommentInTree(prev))
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
  }, [editContent, postType])

  const handleDeleteComment = useCallback(async () => {
    if (!commentToDelete) return

    setSubmitting(true)
    try {
      const result = await deleteComment(commentToDelete, postType)
      if (result.success) {
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
        
        setComments(prev => removeCommentFromTree(prev))
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
  }, [commentToDelete, postType])

  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!currentUser) {
      toast.error("Please log in to like comments")
      return
    }

    try {
      const result = await toggleCommentLike(commentId, postType)
      if (result.success) {
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
        
        setComments(prev => updateLikesInTree(prev))
      } else {
        toast.error(result.error || "Failed to update like")
      }
    } catch (error) {
      toast.error("Failed to update like")
    }
  }, [currentUser, postType])

  const handleReportComment = useCallback(async () => {
    if (!commentToReport || !reportReason) {
      toast.error("Please select a reason for reporting")
      return
    }

    setSubmitting(true)
    try {
      const result = await reportComment(commentToReport, reportReason, undefined, postType)
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
  }, [commentToReport, reportReason, postType])

  const handlePinComment = useCallback(async (commentId: string) => {
    try {
      const result = await togglePinComment(commentId, postType)
      if (result.success) {
        const commentsResult = await getComments(blogPostId, postType)
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
  }, [blogPostId, postType])

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }, [])

  // Memoized callbacks for comment item actions
  const onReplyClick = useCallback((commentId: string) => {
    setReplyingTo(commentId)
    setReplyContent("")
  }, [])

  const onReplyCancel = useCallback(() => {
    setReplyingTo(null)
    setReplyContent("")
  }, [])

  const onEditClick = useCallback((commentId: string, content: string) => {
    setEditingComment(commentId)
    setEditContent(content)
  }, [])

  const onEditCancel = useCallback(() => {
    setEditingComment(null)
    setEditContent("")
  }, [])

  const onDeleteClick = useCallback((commentId: string) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }, [])

  const onReportClick = useCallback((commentId: string) => {
    setCommentToReport(commentId)
    setReportDialogOpen(true)
  }, [])

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
              <Avatar className="w-12 h-12 flex-shrink-0 hidden sm:flex">
                {currentUser.profileImage && (
                  <AvatarImage 
                    src={getOptimizedImageUrl(currentUser.profileImage, {
                      width: 96,
                      height: 96,
                      quality: "100",
                      crop: 'fill',
                      gravity: 'face'
                    })}
                    alt={currentUser.name || 'User'}
                  />
                )}
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:hidden">
                    <Avatar className="w-8 h-8">
                      {currentUser.profileImage && (
                        <AvatarImage 
                          src={getOptimizedImageUrl(currentUser.profileImage, {
                            width: 64,
                            height: 64,
                            quality: "100",
                            crop: 'fill',
                            gravity: 'face'
                          })}
                          alt={currentUser.name || 'User'}
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                        {currentUser.name
                          ? currentUser.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                          : currentUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 truncate max-w-[120px]">
                      {currentUser.name || currentUser.email}
                    </span>
                  </div>
                  <div className="sm:ml-auto">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submitting}
                      className="flex-shrink-0 hover:shadow-md hover:scale-105 transition-all duration-200 group"
                      size="sm"
                    >
                      <Send className="w-4 h-4 sm:mr-2 transition-transform duration-200 group-hover:rotate-12" />
                      <span className="hidden sm:inline">Post Comment</span>
                      <span className="sm:hidden">Post</span>
                    </Button>
                  </div>
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
              <p className="text-muted-foreground text-sm sm:text-base">
                Please log in to join the discussion
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-xs mx-auto">
                <Button asChild className="flex-1">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
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
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  currentUser={currentUser}
                  expandedReplies={expandedReplies}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  editingComment={editingComment}
                  editContent={editContent}
                  submitting={submitting}
                  postType={postType}
                  onReplyClick={onReplyClick}
                  onReplySubmit={handleSubmitReply}
                  onReplyCancel={onReplyCancel}
                  onEditClick={onEditClick}
                  onEditSubmit={handleEditSubmit}
                  onEditCancel={onEditCancel}
                  onDeleteClick={onDeleteClick}
                  onLikeClick={handleLikeComment}
                  onReportClick={onReportClick}
                  onPinClick={handlePinComment}
                  onToggleReplies={toggleReplies}
                  onReplyContentChange={setReplyContent}
                  onEditContentChange={setEditContent}
                />
                {index < comments.length - 1 && (
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
        <DialogContent className="sm:max-w-[425px] max-w-[350px] mx-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg">Delete Comment</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setCommentToDelete(null)
              }}
              className="order-2 sm:order-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteComment}
              disabled={submitting}
              className="order-1 sm:order-2 w-full sm:w-auto"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[350px] mx-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg">Report Comment</DialogTitle>
            <DialogDescription className="text-sm">
              Why are you reporting this comment?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {["Spam", "Inappropriate", "Offensive", "Misleading", "Other"].map((reason) => (
              <label key={reason} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason.toLowerCase()}
                  checked={reportReason === reason.toLowerCase()}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-blue-600 flex-shrink-0"
                />
                <span className="text-sm flex-1">{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setReportDialogOpen(false)
                setCommentToReport(null)
                setReportReason("")
              }}
              className="order-2 sm:order-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportComment}
              disabled={!reportReason || submitting}
              className="order-1 sm:order-2 w-full sm:w-auto"
            >
              Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
