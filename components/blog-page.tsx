"use client"

import { useState, useMemo } from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, User, Tag, MessageCircle, BookOpen, Filter } from "lucide-react"
import Link from "next/link"
import type { BlogCategory } from "@prisma/client"
import { getAuthorDisplay } from "@/lib/author-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BlogPostWithAuthor } from '@/lib/types'
import { MultiSelect, Option } from "@/components/ui/multi-select"

interface IProps {
  blogPosts: BlogPostWithAuthor[]
  categories: BlogCategory[]
}

export function BlogPage(props: IProps) {
  const { blogPosts, categories } = props
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([])
  const [selectedTags, setSelectedTags] = useState<Option[]>([])

  const categoryOptions = useMemo(() =>
    categories.map(cat => ({ value: cat.id, label: cat.name })), [categories]
  )

  const tagOptions = useMemo(() => {
    const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags)))
    return allTags.map(tag => ({ value: tag, label: tag }))
  }, [blogPosts])

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())

    const selectedCategoryValues = selectedCategories.map(c => c.label)
    const matchesCategory = selectedCategories.length === 0 || selectedCategoryValues.includes(post.category?.name || "")

    const selectedTagValues = selectedTags.map(t => t.value)
    const matchesTags = selectedTags.length === 0 || selectedTagValues.every((tag) => post.tags.includes(tag))

    return matchesSearch && matchesCategory && matchesTags
  })

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
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
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-slate-500 hover:text-slate-700 p-1 h-auto"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <MultiSelect
                    options={categoryOptions}
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    placeholder="Select categories..."
                    className="w-full"
                  />
                </div>

                {/* Tags */}
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
                  <MultiSelect
                    options={tagOptions}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Select tags..."
                    className="w-full"
                  />
                </div>
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
                {searchTerm || selectedCategories.length > 0 || selectedTags.length > 0
                  ? "Try adjusting your search or filters"
                  : "No blog posts available"}
              </p>
              {(selectedCategories.length > 0 || selectedTags.length > 0) && (
                <div className="mt-4 flex gap-2 justify-center">
                  {selectedCategories.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategories([])}
                      className="text-xs"
                    >
                      Clear Category Filters
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
