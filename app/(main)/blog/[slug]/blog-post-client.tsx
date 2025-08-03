"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag, ArrowLeft, Share2, Heart, MessageCircle, Clock } from "lucide-react"
import Link from "next/link"
import type { BlogPost, User as UserType, BlogCategory } from "@prisma/client"
import { getAuthorDisplay } from "@/lib/author-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type BlogPostWithAuthor = BlogPost & {
  author: UserType
  member?: {
    id: string
    firstName: string
    lastName: string
    imageUrl?: string | null
    position?: {
      id: string
      name: string
      color: string
    } | null
  } | null
  category: BlogCategory | null
}

interface BlogPostClientProps {
  post: BlogPostWithAuthor
  relatedPosts: BlogPostWithAuthor[]
}

export function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const getCategoryDisplayName = (category: BlogCategory | null) => {
    return category?.name || 'Uncategorized'
  }

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const textContent = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    const wordCount = textContent.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Header */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
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
              {post.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
              <div className="flex items-center space-x-3">
                {(() => {
                  const authorInfo = getAuthorDisplay(post);
                  return (
                    <>
                      {authorInfo.avatar ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={authorInfo.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                            {authorInfo.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
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
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{estimateReadingTime(post.content)} min read</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-8">
                <div
                  className="blog-content prose prose-lg max-w-none 
                    prose-headings:text-slate-800 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                    prose-h1:text-4xl prose-h1:leading-tight prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-4
                    prose-h2:text-3xl prose-h2:leading-tight prose-h2:text-blue-700
                    prose-h3:text-2xl prose-h3:leading-tight prose-h3:text-slate-700
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-strong:text-slate-900 prose-strong:font-semibold
                    prose-em:text-slate-700 prose-em:italic
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 
                    prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:my-6 prose-blockquote:italic
                    prose-blockquote:text-blue-800 prose-blockquote:font-medium
                    prose-ul:text-slate-700 prose-ul:mb-4 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:text-slate-700 prose-ol:mb-4 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:mb-2 prose-li:leading-relaxed
                    prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline
                    prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                    prose-hr:border-slate-300 prose-hr:my-8
                  "
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        {relatedPost.category && (
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
                        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{relatedPost.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">{relatedPost.excerpt || 'No excerpt available'}</p>
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const authorInfo = getAuthorDisplay(relatedPost);
                              return (
                                <>
                                  {authorInfo.avatar ? (
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={authorInfo.avatar} />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
                                        {authorInfo.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <User className="w-3 h-3" />
                                  )}
                                  <div>
                                    <span className="font-medium">{authorInfo.name}</span>
                                    {authorInfo.position && (
                                      <div 
                                        className="text-xs font-medium"
                                        style={{ color: authorInfo.positionColor || '#6b7280' }}
                                      >
                                        {authorInfo.position}
                                      </div>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/blog/${relatedPost.slug}`}>Read More</Link>
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