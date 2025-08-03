"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, User, Tag, MessageCircle, BookOpen, Filter, Crown } from "lucide-react"
import Link from "next/link"
import { getPublishedBlogPosts, getPublishedBlogCategories } from "@/lib/public-blog-actions"
import type { BlogPost, User as UserType, BlogCategory } from "@prisma/client"
import { BlogListSkeleton } from "@/components/blog/blog-skeleton"
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

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPostWithAuthor[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [posts, categoriesData] = await Promise.all([
          getPublishedBlogPosts(),
          getPublishedBlogCategories()
        ])
        setBlogPosts(posts as BlogPostWithAuthor[])
        setCategories(categoriesData as BlogCategory[])
      } catch (error) {
        console.error("Error loading blog data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const categoryOptions = ["All", ...categories.map(cat => cat.name)]
  const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags)))

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || post.category?.name === selectedCategory
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => post.tags.includes(tag))

    return matchesSearch && matchesCategory && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "All": "All",
      "DEVOTIONAL": "Devotional",
      "SERMON": "Sermon",
      "ARTICLE": "Article",
      "ANNOUNCEMENT": "Announcement"
    }
    return categoryMap[category] || category
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
      >
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Church Blog</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Devotionals, articles, and insights to encourage your spiritual journey
            </p>
          </div>
        </section>

        {/* Loading Content */}
        <section className="py-12 bg-white border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading amazing content...</p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <BlogListSkeleton />
          </div>
        </section>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Church Blog</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Devotionals, articles, and insights to encourage your spiritual journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="border-none shadow-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200 w-full"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-600" />
                    <label className="text-sm font-medium text-slate-700">Categories</label>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categoryOptions.map((category) => {
                      const categoryData = categories.find(cat => cat.name === category);
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className={`whitespace-nowrap ${selectedCategory === category ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                          style={{
                            backgroundColor: selectedCategory === category && categoryData ? categoryData.color : selectedCategory === category ? undefined : undefined,
                            borderColor: selectedCategory !== category && categoryData ? categoryData.color : undefined,
                            color: selectedCategory !== category && categoryData ? categoryData.color : undefined
                          }}
                        >
                          {category}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-4 h-4 text-slate-600" />
                      <label className="text-sm font-medium text-slate-700">Filter by Tags</label>
                      {selectedTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTags([])}
                          className="text-xs text-slate-500 hover:text-slate-700 p-1 h-auto"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleTag(tag)}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No articles found</h3>
              <p className="text-slate-500">
                {searchTerm || selectedCategory !== "All" || selectedTags.length > 0
                  ? "Try adjusting your search or filters"
                  : "No blog posts available"}
              </p>
              {(selectedCategory !== "All" || selectedTags.length > 0) && (
                <div className="mt-4 flex gap-2 justify-center">
                  {selectedCategory !== "All" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory("All")}
                      className="text-xs"
                    >
                      Clear Category Filter
                    </Button>
                  )}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-xs"
                    >
                      Clear Tag Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={`h-full flex flex-col border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${post.featured ? "ring-2 ring-blue-200" : ""}`}
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 relative">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-blue-400" />
                        </div>
                      )}
                      {post.featured && (
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-4 right-4 rounded-lg px-3 py-1">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `rgba(255, 255, 255, 0.7)`,
                              color: post.category.color,
                              borderColor: post.category.color
                            }}
                          >
                            {post.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{post.title}</h3>
                        <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">{post.excerpt || 'No excerpt available'}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const authorInfo = getAuthorDisplay(post);
                              return (
                                <>
                                  {authorInfo.avatar ? (
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={authorInfo.avatar} />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
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
                                        className="text-xs font-medium"
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
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4 min-h-[26px]">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Link href={`/blog/${post.slug}`}>Read More</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
