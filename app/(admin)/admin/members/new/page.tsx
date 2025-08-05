"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, User, Crown, Star, Calendar } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User as UserType } from "@prisma/client"
import { createMember } from "@/lib/member-actions"
import { getActivePositions } from "@/lib/position-actions"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewMemberPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [positions, setPositions] = useState<any[]>([])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    imageUrl: "",
    positionId: "",
    featured: false,
    joinDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  })

  useEffect(() => {
    const loadData = async () => {
      const [currentUser, positionsData] = await Promise.all([
        getCurrentUser(),
        getActivePositions()
      ])
      setUser(currentUser)
      setPositions(positionsData)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogin = (loggedInUser: UserType) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const result = await createMember({
        ...formData,
        positionId: formData.positionId === "none" ? undefined : formData.positionId || undefined,
        joinDate: new Date(formData.joinDate),
      })

      if (result.success) {
        toast.success("Member created successfully!")
        router.push("/admin/members")
      } else {
        toast.error(result.error || "Failed to create member")
      }
    } catch (error) {
      toast.error("An error occurred while creating the member")
    } finally {
      setSaving(false)
    }
  }

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
    <AdminPageLayout user={user} onLogout={handleLogout} >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/members")}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Add New Member</h1>
              <p className="text-slate-600 mt-2">Create a new church member profile</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.smith@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biography (optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Brief description of the member's background, interests, or role in the church..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Profile Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/profile-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Church Information */}
            <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <span>Church Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position (optional)</Label>
                    <Select value={formData.positionId} onValueChange={(value) => setFormData(prev => ({ ...prev, positionId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Position</SelectItem>
                        {positions.map((position) => (
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

                  <div>
                    <Label htmlFor="joinDate">Join Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                  />
                  <Label htmlFor="featured" className="flex items-center space-x-2 cursor-pointer">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Featured Member</span>
                  </Label>
                  <span className="text-xs text-slate-500 ml-2">Highlight this member on the public website</span>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 p-6 border rounded-lg bg-white">
                  <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                    <AvatarImage src={formData.imageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                      {formData.firstName && formData.lastName
                        ? getInitials(formData.firstName, formData.lastName)
                        : "??"
                      }
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {formData.firstName || "First"} {formData.lastName || "Last"}
                      </h3>
                      {formData.featured && (
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                    </div>

                    {formData.positionId && formData.positionId !== "none" && (
                      <div className="mb-2">
                        {(() => {
                          const position = positions.find(p => p.id === formData.positionId);
                          return position ? (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded text-sm font-medium text-white"
                              style={{ backgroundColor: position.color }}
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              {position.name}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {formData.bio && (
                      <p className="text-slate-600 text-sm mb-2">{formData.bio}</p>
                    )}

                    <div className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Joined: {new Date(formData.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/members")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.firstName.trim() || !formData.lastName.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving ? "Creating..." : "Create Member"}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}