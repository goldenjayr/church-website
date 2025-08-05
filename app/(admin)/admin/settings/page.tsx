"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { LoginForm } from "@/components/admin/login-form"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { toast } from "sonner"
import { getSiteSettings, updateSiteSettings } from "@/lib/settings-actions"
import {
  Building,
  Globe,
  AtSign,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Youtube,
  Save,
  Image as ImageIcon,
  Palette,
  Type,
  Link as LinkIcon,
  Info
} from "lucide-react"

type SettingsCategory = "general" | "contact" | "social" | "appearance" | "metadata"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [originalSettings, setOriginalSettings] = useState<any>({})
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("general")

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN") {
        const currentSettings = await getSiteSettings()
        setSettings(currentSettings)
        setOriginalSettings(currentSettings)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSiteSettings(settings)
      setOriginalSettings(settings)
      toast.success("Settings updated successfully!")
    } catch (error) {
      toast.error("Failed to update settings.")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

  const renderCategoryForm = () => {
    switch (activeCategory) {
      case "general":
        return (
          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-blue-600" /> General Information</CardTitle>
              <CardDescription>Basic information about your church.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="flex items-center gap-1"><Globe className="w-4 h-4" /> Church Name</Label>
                <Input id="siteName" name="siteName" value={settings.siteName || ""} onChange={handleInputChange} placeholder="e.g., Grace Community Church" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> Logo URL</Label>
                <Input id="logoUrl" name="logoUrl" value={settings.logoUrl || ""} onChange={handleInputChange} placeholder="https://example.com/logo.png" />
              </div>
            </CardContent>
          </Card>
        )
      case "contact":
        return (
          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-green-600" /> Contact Details</CardTitle>
              <CardDescription>How people can get in touch with your church.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-1"><AtSign className="w-4 h-4" /> Contact Email</Label>
                <Input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail || ""} onChange={handleInputChange} placeholder="contact@yourchurch.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="flex items-center gap-1"><Phone className="w-4 h-4" /> Contact Phone</Label>
                <Input id="contactPhone" name="contactPhone" value={settings.contactPhone || ""} onChange={handleInputChange} placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactAddress" className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Address</Label>
                <Input id="contactAddress" name="contactAddress" value={settings.contactAddress || ""} onChange={handleInputChange} placeholder="123 Main St, Anytown, USA" />
              </div>
            </CardContent>
          </Card>
        )
      case "social":
        return (
          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-purple-600" /> Social Media Links</CardTitle>
              <CardDescription>Links to your church's social media profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl" className="flex items-center gap-1"><Facebook className="w-4 h-4" /> Facebook URL</Label>
                <Input id="facebookUrl" name="facebookUrl" value={settings.facebookUrl || ""} onChange={handleInputChange} placeholder="https://facebook.com/yourchurch" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl" className="flex items-center gap-1"><Twitter className="w-4 h-4" /> Twitter (X) URL</Label>
                <Input id="twitterUrl" name="twitterUrl" value={settings.twitterUrl || ""} onChange={handleInputChange} placeholder="https://twitter.com/yourchurch" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl" className="flex items-center gap-1"><Youtube className="w-4 h-4" /> YouTube URL</Label>
                <Input id="youtubeUrl" name="youtubeUrl" value={settings.youtubeUrl || ""} onChange={handleInputChange} placeholder="https://youtube.com/yourchurch" />
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
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

  const navItems: { id: SettingsCategory; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Building },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social Media", icon: LinkIcon },
  ]

  return (
    <AdminPageLayout user={user} onLogout={handleLogout}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
              <p className="text-slate-600 mt-2">Manage your website's global configuration</p>
            </div>
            <Button onClick={handleSubmit} disabled={saving || !hasChanges} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Nav */}
            <div className="lg:col-span-1">
              <Card className="border-none shadow-xl bg-white p-4">
                <nav className="space-y-1">
                  {navItems.map(item => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start text-left ${
                        activeCategory === item.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => setActiveCategory(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit}>
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCategoryForm()}
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>.
      </main>
    </AdminPageLayout>
  )
}
