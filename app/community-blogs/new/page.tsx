"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Eye,
  EyeOff,
  Tag,
  Image as ImageIcon,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react"
import { createUserBlogPost } from "@/lib/user-blog-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import { uploadImage } from "@/lib/upload-image"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }
)

export default function NewBlogPostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [coverImagePreview, setCoverImagePreview] = useState("") // For local preview
  const [uploadingImage, setUploadingImage] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push("/login")
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB")
      return
    }

    setUploadingImage(true)

    // Convert to base64 for upload
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setCoverImagePreview(base64) // Set local preview immediately

      try {
        // Upload to Cloudinary
        const result = await uploadImage(base64, 'user-blogs')
        if (result.success && result.url) {
          setCoverImage(result.url) // Store Cloudinary URL
          toast.success("Image uploaded successfully")
        } else {
          toast.error(result.error || "Failed to upload image")
          setCoverImagePreview("") // Clear preview on error
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Failed to upload image")
        setCoverImagePreview("") // Clear preview on error
      } finally {
        setUploadingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please enter a title for your blog post")
      return
    }

    if (!content.trim()) {
      toast.error("Please add some content to your blog post")
      return
    }

    setLoading(true)

    try {
      const result = await createUserBlogPost({
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        tags: tags.length > 0 ? tags : undefined,
        published
      })

      if (result.success) {
        toast.success(published ? "Blog post published successfully!" : "Blog post saved as draft!")
        // If it's a draft, redirect to My Blogs tab, otherwise to All Blogs
        router.push(published ? "/community-blogs" : "/community-blogs?tab=my")
      } else {
        toast.error(result.error || "Failed to create blog post")
      }
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/community-blogs" 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Blogs</span>
              </Link>
              <div className="w-px h-6 bg-slate-300" />
              <h1 className="text-xl font-bold text-slate-800">Create New Blog Post</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreview(!preview)}
                className="hidden sm:flex"
              >
                {preview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !title || !content}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {published ? "Publish" : "Save Draft"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {preview ? (
          // Preview Mode
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Preview Mode</Badge>
                  <Badge variant={published ? "default" : "secondary"}>
                    {published ? "Will be published" : "Draft"}
                  </Badge>
                </div>
                {coverImage && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={coverImage} 
                      alt="Cover" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-3xl">{title || "Untitled Blog Post"}</CardTitle>
                {excerpt && (
                  <CardDescription className="text-lg mt-2">{excerpt}</CardDescription>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content || "<p>No content yet...</p>" }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Content Card */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Blog Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-base font-medium">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter an engaging title for your blog post..."
                          className="text-lg h-12"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="excerpt" className="text-base font-medium">
                          Excerpt (Optional)
                        </Label>
                        <Textarea
                          id="excerpt"
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="A brief summary of your blog post..."
                          rows={3}
                        />
                        <p className="text-sm text-slate-500">
                          This will appear in blog listings. If left empty, the first part of your content will be used.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content" className="text-base font-medium">
                          Content <span className="text-red-500">*</span>
                        </Label>
                        <RichTextEditor
                          content={content}
                          onChange={setContent}
                          placeholder="Share your story, testimony, or insights..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-6">
                  {/* Publishing Options */}
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Publishing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="published" className="text-base">
                            Publish immediately
                          </Label>
                          <p className="text-sm text-slate-500">
                            {published ? "Your blog will be visible to everyone" : "Save as draft for later"}
                          </p>
                        </div>
                        <Switch
                          id="published"
                          checked={published}
                          onCheckedChange={setPublished}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cover Image */}
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Cover Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(coverImage || coverImagePreview) ? (
                        <div className="relative">
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="text-sm text-slate-600">Uploading...</span>
                              </div>
                            </div>
                          )}
                          <img
                            src={coverImage || coverImagePreview}
                            alt="Cover"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setCoverImage("")
                              setCoverImagePreview("")
                            }}
                            disabled={uploadingImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <Label htmlFor="image-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                            Click to upload image
                          </Label>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddTag()
                            }
                          }}
                          placeholder="Add a tag..."
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddTag}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Writing Tips:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Share personal experiences and testimonies</li>
                        <li>• Keep your content authentic and relatable</li>
                        <li>• Use images to make your post more engaging</li>
                        <li>• Add relevant tags to help others find your post</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </motion.div>
          </form>
        )}
      </main>
    </div>
  )
}
