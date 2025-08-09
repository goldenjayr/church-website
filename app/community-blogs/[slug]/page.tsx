"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommunityBlogEngagement, CommunityBlogEngagementCompact } from "@/components/blog/community-blog-engagement"
import { BlogEngagementStats } from "@/components/blog/blog-engagement"
import { CommentSection } from "@/components/blog/comment-section"
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  Eye,
  Heart,
} from "lucide-react"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"
import { 
  getUserBlogPostBySlug,
  getRelatedUserBlogPosts
} from "@/lib/user-blog-actions"
import { getPublishedBlogPosts } from "@/lib/public-blog-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import { toast } from "sonner"
import "@/styles/blog-content.css"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [relatedCommunityPosts, setRelatedCommunityPosts] = useState<any[]>([])
  const [churchPosts, setChurchPosts] = useState<any[]>([])

  useEffect(() => {
    loadPost()
  }, [params.slug])

  const loadPost = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      const postData = await getUserBlogPostBySlug(params.slug as string)
      if (!postData) {
        toast.error("Blog post not found")
        router.push("/community-blogs")
        return
      }

      setPost(postData)
      
      // Load related community posts
      const related = await getRelatedUserBlogPosts(postData.id, postData.tags || [])
      setRelatedCommunityPosts(related.slice(0, 3))
      
      // Load church blog posts for increased reach
      const churchBlogPosts = await getPublishedBlogPosts()
      setChurchPosts(churchBlogPosts.slice(0, 3))
    } catch (error) {
      console.error("Error loading post:", error)
      toast.error("Failed to load blog post")
    } finally {
      setLoading(false)
    }
  }



  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const textContent = content.replace(/<[^>]*>/g, '')
    const wordCount = textContent.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >

      {/* Header Section - Church Blog Style */}
      <section className="py-8 sm:py-12 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/community-blogs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community Blogs
              </Link>
            </Button>

            {/* Category and Featured Badges */}
            <div className="flex items-center space-x-3 mb-4">
              {post.published && <Badge className="bg-green-100 text-green-800">Published</Badge>}
              {user?.id === post.authorId && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/community-blogs/${post.slug}/edit`}>
                    Edit Post
                  </Link>
                </Button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600 mb-6">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={post.author?.profileImage ? getOptimizedImageUrl(post.author.profileImage, {
                      width: 64,
                      height: 64,
                      quality: "auto",
                      crop: "fill",
                      gravity: "face"
                    }) : undefined}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                    {post.author?.name?.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{post.author?.name || "Anonymous"}</span>
                  {post.author?.role && (
                    <span className="text-sm font-medium text-gray-500">
                      Community Member
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{estimateReadingTime(post.content)} min read</span>
              </div>
            </div>

            {/* Integrated Engagement System */}
            <CommunityBlogEngagement slug={post.slug} />
          </motion.div>
        </div>
      </section>

      {/* Content Section - Church Blog Style */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Cover Image if exists */}
            {post.coverImage && (
              <Card className="border-none shadow-lg mb-8">
                <CardContent className="p-0">
                  <img
                    src={getOptimizedImageUrl(post.coverImage, {
                      width: 1200,
                      height: 600,
                      quality: "auto",
                      crop: "fill"
                    })}
                    alt={post.title}
                    className="w-full h-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div
                  className="blog-content prose sm:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  )) || <span className="text-slate-500">No tags</span>}
                </div>
              </CardContent>
            </Card>

            {/* Author Bio - Keep this unique section */}
            {post.author?.bio && (
              <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={post.author.profileImage ? getOptimizedImageUrl(post.author.profileImage, {
                          width: 128,
                          height: 128,
                          quality: "auto",
                          crop: "fill",
                          gravity: "face"
                        }) : undefined}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-xl">
                        {post.author.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 mb-2">
                        {post.author.name}
                      </p>
                      <p className="text-slate-600">
                        {post.author.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section - Using same component as church blog */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-3 sm:p-6">
                <CommentSection blogPostId={post.id} blogPostSlug={post.slug} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Community Posts Section */}
      {relatedCommunityPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Related Community Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {relatedCommunityPosts.map((relatedPost: any, index: number) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{relatedPost.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">{relatedPost.excerpt || 'No excerpt available'}</p>
                        
                        <div className="mb-3">
                          <CommunityBlogEngagementCompact slug={relatedPost.slug} />
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={relatedPost.author?.profileImage ? getOptimizedImageUrl(relatedPost.author.profileImage, {
                                width: 40,
                                height: 40,
                                quality: "auto",
                                crop: "fill",
                                gravity: "face"
                              }) : undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                {relatedPost.author?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{relatedPost.author?.name || "Anonymous"}</span>
                          </div>
                          <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/community-blogs/${relatedPost.slug}`}>Read More</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Church Blog Posts Section - For Increased Reach */}
      {churchPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">From Our Church Blog</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {churchPosts.map((churchPost: any, index: number) => (
                  <motion.div
                    key={churchPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        {churchPost.category && (
                          <Badge
                            variant="outline"
                            className="mb-3"
                            style={{
                              borderColor: churchPost.category.color,
                              color: churchPost.category.color,
                              backgroundColor: `${churchPost.category.color}10`
                            }}
                          >
                            {churchPost.category.name}
                          </Badge>
                        )}
                        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{churchPost.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">{churchPost.excerpt || 'No excerpt available'}</p>

                        <div className="mb-3">
                          <BlogEngagementStats slug={churchPost.slug} />
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{churchPost.author?.name || "Church Admin"}</span>
                          </div>
                          <span>{new Date(churchPost.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/blog/${churchPost.slug}`}>Read More</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  )
}
