"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { getAuthorDisplay } from "@/lib/author-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UnifiedBlogEngagement, UnifiedBlogEngagementCompact } from "@/components/blog/unified-blog-engagement"
import { CommentSection } from "@/components/blog/comment-section"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"
import { getBlogPostUrl } from "@/lib/combined-blog-utils"
import "@/styles/blog-content.css"

interface UnifiedBlogPostProps {
  post: any
  relatedPosts?: any[]
  currentUser?: any
  postType: 'church' | 'community'
}

export function UnifiedBlogPost({ post, relatedPosts = [], currentUser, postType }: UnifiedBlogPostProps) {
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const textContent = content.replace(/<[^>]*>/g, '')
    const wordCount = textContent.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const isOwner = currentUser?.id === post.authorId
  const backUrl = postType === 'church' ? '/blog' : '/community-blogs'
  const backLabel = postType === 'church' ? 'Back to Blog' : 'Back to Community Blogs'

  // Get appropriate author display info
  const getAuthorInfo = () => {
    if (postType === 'church') {
      return getAuthorDisplay(post)
    }

    // For community posts
    return {
      name: post.author?.name || 'Anonymous',
      position: 'Community Member',
      positionColor: '#6b7280',
      avatar: post.author?.profileImage ? getOptimizedImageUrl(post.author.profileImage, {
        width: 64,
        height: 64,
        quality: "auto",
        crop: "fill",
        gravity: "face"
      }) : null
    }
  }

  const authorInfo = getAuthorInfo()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <section className="py-8 sm:py-12 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Button asChild variant="ghost" className="mb-6">
              <Link href={backUrl}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Link>
            </Button>

            <div className="flex items-center space-x-3 mb-4">
              {post.category && (
                <Badge
                  variant="outline"
                  style={{
                    borderColor: post.category.color,
                    color: post.category.color,
                    backgroundColor: `${post.category.color}10`
                  }}
                >
                  {post.category.name}
                </Badge>
              )}
              {post.featuring && (
                <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600 mb-6">
              <div className="flex items-center space-x-3">
                {authorInfo.avatar ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={authorInfo.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                      {authorInfo.name.split(' ').map((word: string) => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="w-4 h-4" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{authorInfo.name}</span>
                  {authorInfo.position && (
                    <span
                      className="text-sm font-medium"
                      style={{ color: authorInfo.positionColor || '#6b7280' }}
                    >
                      {authorInfo.position}
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

            {/* Engagement System - Unified for both types */}
            <UnifiedBlogEngagement 
              slug={post.slug} 
              blogType={postType === 'church' ? 'admin' : 'user'}
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Cover Image if exists (for community posts) */}
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
            {post.tags && post.tags.length > 0 && (
              <Card className="border-none shadow-lg mb-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Author Bio (for community posts) */}
            {postType === 'community' && post.author?.bio && (
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

            {/* Comments Section */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-3 sm:p-6">
                <CommentSection
                  blogPostId={post.id}
                  blogPostSlug={post.slug}
                  postType={postType}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                {postType === 'church' ? 'Related Articles' : 'Related Community Posts'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map((relatedPost: any, index: number) => {
                  const relatedPostUrl = getBlogPostUrl({
                    ...relatedPost,
                    postType: relatedPost.authorId ? 'community' : 'church'
                  })
                  const relatedAuthorInfo = postType === 'church'
                    ? getAuthorDisplay(relatedPost)
                    : {
                        name: relatedPost.author?.name || 'Anonymous',
                        avatar: relatedPost.author?.profileImage ? getOptimizedImageUrl(relatedPost.author.profileImage, {
                          width: 40,
                          height: 40,
                          quality: "auto",
                          crop: "fill",
                          gravity: "face"
                        }) : null
                      }

                  return (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-6">
                          {relatedPost.category && postType === 'church' && (
                            <Badge
                              variant="outline"
                              className="mb-3"
                              style={{
                                borderColor: relatedPost.category.color,
                                color: relatedPost.category.color,
                                backgroundColor: `${relatedPost.category.color}10`
                              }}
                            >
                              {relatedPost.category.name}
                            </Badge>
                          )}
                          <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-slate-600 mb-4 line-clamp-3">
                            {relatedPost.excerpt || 'No excerpt available'}
                          </p>

                          {/* Engagement stats - Using unified compact component */}
                          <div className="mb-3">
                            <UnifiedBlogEngagementCompact 
                              slug={relatedPost.slug} 
                              blogType={relatedPost.authorId ? 'user' : 'admin'}
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                            <div className="flex items-center space-x-2">
                              {relatedAuthorInfo.avatar ? (
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={relatedAuthorInfo.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                    {relatedAuthorInfo.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                              <span className="font-medium">{relatedAuthorInfo.name}</span>
                            </div>
                            <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Button asChild variant="outline" className="w-full bg-transparent">
                            <Link href={relatedPostUrl}>Read More</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  )
}
