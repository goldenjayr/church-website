"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Inbox,
  Star,
  Archive,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Reply,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  StarOff,
  ArchiveX,
  Plus,
  Edit,
  FileText,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import {
  getMessages,
  getMessage,
  updateMessageStatus,
  toggleMessageStar,
  toggleMessageArchive,
  deleteMessage,
  deleteMessages,
  updateMessageNotes,
  getMessageStats,
  sendMessageReply,
} from "@/lib/message-actions"
import { getSiteSettings } from "@/lib/settings-actions"
import type { User, ContactMessage, MessageStatus } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface MessageWithActions extends ContactMessage {
  selected?: boolean
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<MessageWithActions[]>([])
  const [filteredMessages, setFilteredMessages] = useState<MessageWithActions[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [stats, setStats] = useState({ total: 0, unread: 0, starred: 0, archived: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "ALL">("ALL")
  const [activeTab, setActiveTab] = useState("inbox")
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [emailTemplates] = useState([
    { 
      id: 'greeting', 
      name: 'Friendly Greeting',
      content: `Thank you for reaching out to Divine Jesus Church! We appreciate you taking the time to contact us.

[Your message here]

If you have any further questions or need additional assistance, please don't hesitate to reach out.

May God bless you abundantly!`
    },
    {
      id: 'event',
      name: 'Event Information',
      content: `Thank you for your interest in our church events!

[Event details here]

We'd love to see you there! Please let us know if you have any questions or need directions to our church.

Looking forward to seeing you!`
    },
    {
      id: 'prayer',
      name: 'Prayer Support',
      content: `Thank you for sharing your prayer request with us. We want you to know that we are standing with you in prayer.

[Your message here]

Please know that our prayer team will be lifting you up in prayer. God hears every prayer and cares deeply about what you're going through.

Be encouraged - we serve a faithful God!`
    },
    {
      id: 'general',
      name: 'General Response',
      content: `Thank you for contacting Divine Jesus Church.

[Your response here]

We hope this information is helpful. Please feel free to reach out if you need anything else.

Blessings!`
    }
  ])
  const [selectedTemplate, setSelectedTemplate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterMessages()
  }, [messages, searchQuery, statusFilter, activeTab])

  const loadData = async () => {
    try {
      const [currentUser, settings] = await Promise.all([
        getCurrentUser(),
        getSiteSettings()
      ])
      setUser(currentUser)
      setSiteSettings(settings)
      
      if (currentUser && currentUser.role === "ADMIN") {
        await refreshMessages()
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshMessages = async () => {
    try {
      const [messagesData, statsData] = await Promise.all([
        getMessages(),
        getMessageStats(),
      ])
      setMessages(messagesData)
      setStats(statsData)
    } catch (error) {
      console.error("Error refreshing messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    }
  }

  const filterMessages = () => {
    let filtered = [...messages]

    // Filter by tab
    if (activeTab === "starred") {
      filtered = filtered.filter(m => m.starred && !m.archived)
    } else if (activeTab === "archived") {
      filtered = filtered.filter(m => m.archived)
    } else {
      filtered = filtered.filter(m => !m.archived)
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query) ||
        m.message.toLowerCase().includes(query)
      )
    }

    setFilteredMessages(filtered)
  }

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setAdminNotes(message.notes || "")
    
    // Mark as read if unread
    if (message.status === "UNREAD") {
      const result = await updateMessageStatus(message.id, "READ")
      if (result.success) {
        await refreshMessages()
      }
    }
  }

  const handleToggleStar = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation()
    const result = await toggleMessageStar(messageId)
    if (result.success) {
      await refreshMessages()
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(result.message!)
      }
    }
  }

  const handleToggleArchive = async (messageId: string) => {
    const result = await toggleMessageArchive(messageId)
    if (result.success) {
      await refreshMessages()
      setSelectedMessage(null)
      toast({
        title: "Success",
        description: result.message?.archived ? "Message archived" : "Message unarchived",
      })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    const result = await deleteMessage(messageId)
    if (result.success) {
      await refreshMessages()
      setSelectedMessage(null)
      setShowDeleteDialog(false)
      toast({
        title: "Success",
        description: "Message deleted",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return
    
    const result = await deleteMessages(selectedMessages)
    if (result.success) {
      await refreshMessages()
      setSelectedMessages([])
      toast({
        title: "Success",
        description: `${selectedMessages.length} messages deleted`,
      })
    }
  }

  const handleUpdateStatus = async (messageId: string, status: MessageStatus) => {
    const result = await updateMessageStatus(messageId, status)
    if (result.success) {
      await refreshMessages()
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(result.message!)
      }
      toast({
        title: "Success",
        description: `Message marked as ${status.toLowerCase()}`,
      })
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedMessage) return
    
    const result = await updateMessageNotes(selectedMessage.id, adminNotes)
    if (result.success) {
      await refreshMessages()
      setSelectedMessage(result.message!)
      setIsEditingNotes(false)
      toast({
        title: "Success",
        description: "Notes saved",
      })
    }
  }

  const toggleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }

  const selectAllMessages = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id))
    }
  }

  const getStatusBadge = (status: MessageStatus) => {
    const statusConfig = {
      UNREAD: { label: "Unread", className: "bg-blue-100 text-blue-700" },
      READ: { label: "Read", className: "bg-slate-100 text-slate-700" },
      REPLIED: { label: "Replied", className: "bg-green-100 text-green-700" },
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    }
    
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return <LoginForm onLogin={setUser} />
  }

  return (
    <AdminPageLayout user={user} onLogout={() => setUser(null)}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
            <p className="text-slate-600 mt-2">
              Manage and respond to messages from your website visitors
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Messages</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Inbox className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Unread</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stats.unread}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Starred</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stats.starred}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Archived</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stats.archived}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Archive className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-3 h-[600px]">
                {/* Messages List */}
                <div className="border-r border-slate-200 overflow-hidden flex flex-col">
                  {/* Filters */}
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Status</SelectItem>
                          <SelectItem value="UNREAD">Unread</SelectItem>
                          <SelectItem value="READ">Read</SelectItem>
                          <SelectItem value="REPLIED">Replied</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full">
                        <TabsTrigger value="inbox" className="flex-1">
                          <Inbox className="w-4 h-4 mr-2" />
                          Inbox
                        </TabsTrigger>
                        <TabsTrigger value="starred" className="flex-1">
                          <Star className="w-4 h-4 mr-2" />
                          Starred
                        </TabsTrigger>
                        <TabsTrigger value="archived" className="flex-1">
                          <Archive className="w-4 h-4 mr-2" />
                          Archived
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Bulk Actions */}
                  {selectedMessages.length > 0 && (
                    <div className="p-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        {selectedMessages.length} selected
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={selectAllMessages}
                        >
                          {selectedMessages.length === filteredMessages.length ? "Deselect All" : "Select All"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleBulkDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence>
                      {filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                          <MessageSquare className="w-12 h-12 mb-4" />
                          <p>No messages found</p>
                        </div>
                      ) : (
                        filteredMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`
                              border-b border-slate-200 p-4 cursor-pointer
                              hover:bg-slate-50 transition-colors
                              ${selectedMessage?.id === message.id ? "bg-blue-50" : ""}
                              ${message.status === "UNREAD" ? "font-semibold" : ""}
                            `}
                            onClick={() => handleSelectMessage(message)}
                          >
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedMessages.includes(message.id)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  toggleSelectMessage(message.id)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1"
                              />
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                  {getInitials(message.firstName, message.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900 truncate">
                                      {message.firstName} {message.lastName}
                                    </p>
                                    <p className="text-sm text-slate-600 truncate">
                                      {message.subject}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate mt-1">
                                      {message.message}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end space-y-1 ml-2">
                                    <button
                                      onClick={(e) => handleToggleStar(e, message.id)}
                                      className="text-slate-400 hover:text-yellow-500"
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          message.starred ? "fill-yellow-500 text-yellow-500" : ""
                                        }`}
                                      />
                                    </button>
                                    <span className="text-xs text-slate-500">
                                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2 overflow-hidden flex flex-col">
                  {selectedMessage ? (
                    <>
                      {/* Message Header */}
                      <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                {getInitials(selectedMessage.firstName, selectedMessage.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {selectedMessage.firstName} {selectedMessage.lastName}
                              </h3>
                              <p className="text-sm text-slate-600">{selectedMessage.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(selectedMessage.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateStatus(selectedMessage.id, "UNREAD")}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Mark as Unread
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(selectedMessage.id, "PENDING")}>
                                  <Clock className="w-4 h-4 mr-2" />
                                  Mark as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(selectedMessage.id, "REPLIED")}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Replied
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStar(new MouseEvent('click') as any, selectedMessage.id)}>
                                  {selectedMessage.starred ? (
                                    <>
                                      <StarOff className="w-4 h-4 mr-2" />
                                      Unstar
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4 mr-2" />
                                      Star
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleArchive(selectedMessage.id)}>
                                  {selectedMessage.archived ? (
                                    <>
                                      <ArchiveX className="w-4 h-4 mr-2" />
                                      Unarchive
                                    </>
                                  ) : (
                                    <>
                                      <Archive className="w-4 h-4 mr-2" />
                                      Archive
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setShowDeleteDialog(true)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <h2 className="text-xl font-semibold text-slate-900 mb-2">
                          {selectedMessage.subject}
                        </h2>

                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(selectedMessage.createdAt), "PPP")}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {format(new Date(selectedMessage.createdAt), "p")}
                          </div>
                          {selectedMessage.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {selectedMessage.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-wrap text-slate-700">
                            {selectedMessage.message}
                          </p>
                        </div>

                        {/* Admin Notes */}
                        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900">Admin Notes</h3>
                            {!isEditingNotes ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditingNotes(true)}
                              >
                                Edit
                              </Button>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setAdminNotes(selectedMessage.notes || "")
                                    setIsEditingNotes(false)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSaveNotes}
                                >
                                  Save
                                </Button>
                              </div>
                            )}
                          </div>
                          {isEditingNotes ? (
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about this message..."
                              rows={3}
                            />
                          ) : (
                            <p className="text-sm text-slate-600">
                              {selectedMessage.notes || "No notes added yet"}
                            </p>
                          )}
                        </div>

                        {/* Reply Status */}
                        {selectedMessage.repliedAt && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">
                              Replied on {format(new Date(selectedMessage.repliedAt), "PPP 'at' p")}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            onClick={() => handleToggleArchive(selectedMessage.id)}
                          >
                            {selectedMessage.archived ? (
                              <>
                                <ArchiveX className="w-4 h-4 mr-2" />
                                Unarchive
                              </>
                            ) : (
                              <>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </>
                            )}
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowDeleteDialog(true)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                            <Button
                              onClick={() => setShowReplyDialog(true)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Reply className="w-4 h-4 mr-2" />
                              Reply via Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                      <Mail className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">Select a message to view</p>
                      <p className="text-sm mt-2">Choose a message from the list to see details</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedMessage && handleDeleteMessage(selectedMessage.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={(open) => {
          setShowReplyDialog(open)
          if (!open) {
            setReplyMessage('')
            setSelectedTemplate('')
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Reply className="w-5 h-5 text-white" />
                </div>
                Compose Reply
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid lg:grid-cols-5 gap-6 p-6">
                {/* Left side - Email Compose */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Recipients */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">To:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                              {selectedMessage && getInitials(selectedMessage.firstName, selectedMessage.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-slate-900">
                            {selectedMessage?.firstName} {selectedMessage?.lastName}
                          </span>
                          <span className="text-sm text-slate-600">
                            &lt;{selectedMessage?.email}&gt;
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Subject:</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Re: {selectedMessage?.subject}</p>
                    </div>
                  </div>

                  {/* Email Templates */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      Quick Templates
                    </label>
                    <Select value={selectedTemplate} onValueChange={(value) => {
                      setSelectedTemplate(value)
                      const template = emailTemplates.find(t => t.id === value)
                      if (template) {
                        setReplyMessage(template.content)
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message Compose */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Message
                      </span>
                      <span className="text-xs text-slate-500">
                        {replyMessage.length} characters
                      </span>
                    </label>
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={12}
                      className="resize-none font-normal"
                    />
                  </div>

                  {/* Signature */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 mb-1">Your signature will be added automatically:</p>
                    <p className="text-sm text-blue-900 italic">
                      Blessings,<br />
                      {user?.name || 'Divine Jesus Church Team'}
                    </p>
                  </div>
                </div>

                {/* Right side - Original Message */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4" />
                      Original Message
                    </h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">From:</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedMessage?.firstName} {selectedMessage?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Date:</p>
                        <p className="text-sm text-slate-700">
                          {selectedMessage && format(new Date(selectedMessage.createdAt), "PPP 'at' p")}
                        </p>
                      </div>
                      {selectedMessage?.phone && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Phone:</p>
                          <p className="text-sm text-slate-700">{selectedMessage.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Subject:</p>
                        <p className="text-sm font-medium text-slate-900">{selectedMessage?.subject}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-2">Message:</p>
                        <div className="max-h-48 overflow-y-auto">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {selectedMessage?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const greeting = `Dear ${selectedMessage?.firstName},\n\n`
                          if (!replyMessage.startsWith(greeting)) {
                            setReplyMessage(greeting + replyMessage)
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Greeting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const serviceInfo = `\n\nOur service times are:\n- Sabbath Worship: Saturdays at 8:00 AM\n- Prayer Meeting: Wednesdays at 7:00 PM\n- Bible Study: Sundays at 9:00 PM`
                          if (!replyMessage.includes('service times')) {
                            setReplyMessage(replyMessage + serviceInfo)
                          }
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Add Service Times
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const phone = siteSettings?.contactPhone || 'Not available'
                          const email = siteSettings?.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@divinejesus.org'
                          const address = siteSettings?.contactAddress || 'Visit our website for directions'
                          
                          const contactInfo = `\n\nFor more information, you can reach us at:\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}`
                          if (!replyMessage.includes('reach us at')) {
                            setReplyMessage(replyMessage + contactInfo)
                          }
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Add Contact Info
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t pt-4 px-6 pb-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Email will be sent via Resend</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReplyDialog(false)
                      setReplyMessage('')
                      setSelectedTemplate('')
                    }}
                    disabled={isSendingReply}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!selectedMessage || !replyMessage.trim()) {
                        toast({
                          title: "Error",
                          description: "Please enter a message",
                          variant: "destructive",
                        })
                        return
                      }
                      
                      setIsSendingReply(true)
                      
                      try {
                        const result = await sendMessageReply(
                          selectedMessage.id,
                          replyMessage,
                          user?.name || undefined
                        )
                        
                        if (result.success) {
                          toast({
                            title: "Reply Sent Successfully! ✉️",
                            description: `Your reply has been sent to ${selectedMessage.firstName} ${selectedMessage.lastName}`,
                          })
                          await refreshMessages()
                          if (selectedMessage) {
                            const updated = await getMessage(selectedMessage.id)
                            if (updated) setSelectedMessage(updated)
                          }
                          setShowReplyDialog(false)
                          setReplyMessage('')
                          setSelectedTemplate('')
                        } else {
                          toast({
                            title: "Error",
                            description: result.error || "Failed to send reply",
                            variant: "destructive",
                          })
                        }
                      } finally {
                        setIsSendingReply(false)
                      }
                    }}
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="min-w-[140px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  >
                    {isSendingReply ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AdminPageLayout>
  )
}
