"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { 
  getUserBlogPostBySlug,
  updateUserBlogPost,
  uploadBlogImage
} from "@/lib/user-blog-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import dynamic from "next/dynamic"

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 border rounded-lg flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }
)

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Form fields
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [published, setPublished] = useState(false)
  const [coverImage, setCoverImage] = useState("")
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadPost()
  }, [params.slug])

  const loadPost = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error("Please log in to edit posts")
        router.push("/login")
        return
      }
      setUser(currentUser)

      const postData = await getUserBlogPostBySlug(params.slug as string)
      if (!postData) {
        toast.error("Blog post not found")
        router.push("/community-blogs")
        return
      }

      // Check if user is the author
      if (postData.authorId !== currentUser.id) {
        toast.error("You can only edit your own posts")
        router.push(`/community-blogs/${params.slug}`)
        return
      }

      setPost(postData)
      setTitle(postData.title)
      setExcerpt(postData.excerpt || "")
      setContent(postData.content)
      setTags(postData.tags || [])
      setPublished(postData.published)
      setCoverImage(postData.coverImage || "")
    } catch (error) {
      console.error("Error loading post:", error)
      toast.error("Failed to load blog post")
      router.push("/community-blogs")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const result = await uploadBlogImage(formData)
      if (result.success && result.url) {
        setCoverImage(result.url)
        toast.success("Image uploaded successfully")
      } else {
        toast.error(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    // Validate required fields
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!content.trim()) {
      toast.error("Content is required")
      return
    }

    setSaving(true)
    try {
      const result = await updateUserBlogPost(post.id, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        tags,
        published,
        coverImage,
      })

      if (result.success) {
        toast.success("Blog post updated successfully")
        router.push(`/community-blogs/${post.slug}`)
      } else {
        toast.error(result.error || "Failed to update blog post")
      }
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error("Failed to save blog post")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/community-blogs/${post.slug}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Post</span>
              </Link>
              <div className="w-px h-6 bg-slate-300" />
              <h1 className="font-bold text-xl text-slate-800">Edit Blog Post</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="hidden md:flex"
              >
                {previewMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {previewMode ? (
            // Preview Mode
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <h1 className="text-4xl font-bold text-slate-800 mb-4">{title || "Untitled"}</h1>
                {excerpt && (
                  <p className="text-lg text-slate-600 mb-6">{excerpt}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </CardContent>
            </Card>
          ) : (
            // Edit Mode
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Blog Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter blog title"
                        className="mt-1"
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief description of your post"
                        rows={3}
                        className="mt-1"
                      />
                      <p className="text-sm text-slate-500 mt-1">
                        This will appear in blog cards and search results
                      </p>
                    </div>

                    {/* Content */}
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <div className="mt-1">
                        <RichTextEditor
                          content={content}
                          onChange={setContent}
                          placeholder="Write your blog post content..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publishing Options */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Publishing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="published">Publish Post</Label>
                      <Switch
                        id="published"
                        checked={published}
                        onCheckedChange={setPublished}
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      {published
                        ? "Your post is visible to everyone"
                        : "Your post is saved as a draft"}
                    </p>
                  </CardContent>
                </Card>

                {/* Cover Image */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Cover Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {coverImage ? (
                      <div className="relative">
                        <img
                          src={coverImage}
                          alt="Cover"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setCoverImage("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">
                            Click to upload
                          </span>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </Label>
                        {uploadingImage && (
                          <div className="mt-2">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddTag()
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
