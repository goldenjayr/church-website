"use client"

import { memo } from "react"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import {
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
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { User as UserType } from "@prisma/client"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"

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
    profileImage?: string | null
  }
  replies?: Comment[]
  commentLikes?: Array<{ userId: string }>
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

export const CommentItem = memo(function CommentItem({
  comment,
  isReply = false,
  currentUser,
  expandedReplies,
  replyingTo,
  replyContent,
  editingComment,
  editContent,
  submitting,
  onReplyClick,
  onReplySubmit,
  onReplyCancel,
  onEditClick,
  onEditSubmit,
  onEditCancel,
  onDeleteClick,
  onLikeClick,
  onReportClick,
  onPinClick,
  onToggleReplies,
  onReplyContentChange,
  onEditContentChange,
}: CommentItemProps) {
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
          <AvatarImage 
            src={comment.user.profileImage ? getOptimizedImageUrl(comment.user.profileImage, { width: 40, height: 40 }) : undefined} 
          />
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
                      onClick={() => onEditClick(comment.id, comment.content)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteClick(comment.id)}
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
                    <DropdownMenuItem onClick={() => onPinClick(comment.id)}>
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
                      onClick={() => onReportClick(comment.id)}
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
                onChange={(e) => onEditContentChange(e.target.value)}
                className="min-h-[80px]"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onEditSubmit(comment.id)}
                  disabled={submitting}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEditCancel}
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
              onClick={() => onLikeClick(comment.id)}
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
                onClick={() => onReplyClick(comment.id)}
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
                onClick={() => onToggleReplies(comment.id)}
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
                onChange={(e) => onReplyContentChange(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onReplySubmit(comment.id)}
                  disabled={submitting}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReplyCancel}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {hasReplies && areRepliesExpanded && (
            <div className="mt-4 space-y-4">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  currentUser={currentUser}
                  expandedReplies={expandedReplies}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  editingComment={editingComment}
                  editContent={editContent}
                  submitting={submitting}
                  onReplyClick={onReplyClick}
                  onReplySubmit={onReplySubmit}
                  onReplyCancel={onReplyCancel}
                  onEditClick={onEditClick}
                  onEditSubmit={onEditSubmit}
                  onEditCancel={onEditCancel}
                  onDeleteClick={onDeleteClick}
                  onLikeClick={onLikeClick}
                  onReportClick={onReportClick}
                  onPinClick={onPinClick}
                  onToggleReplies={onToggleReplies}
                  onReplyContentChange={onReplyContentChange}
                  onEditContentChange={onEditContentChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})
