"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, User, Tag, MessageCircle } from "lucide-react"
import Link from "next/link"

// Mock data - this would come from your database
const blogPosts = [
  {
    id: 1,
    title: "Walking in Faith Daily",
    slug: "walking-in-faith-daily",
    excerpt:
      "Discover how to make faith a daily practice in your life and maintain a strong relationship with Christ throughout the week.",
    content: "Faith is not just a Sunday experience, but a daily walk with God...",
    author: "Pastor John Smith",
    date: "2024-01-10",
    category: "Devotional",
    tags: ["faith", "daily-walk", "spiritual-growth"],
    featured: true,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 2,
    title: "The Power of Prayer",
    slug: "the-power-of-prayer",
    excerpt:
      "Learn about the transformative power of prayer in your spiritual journey and how it can change your life.",
    content: "Prayer is our direct line of communication with God...",
    author: "Elder Mary Johnson",
    date: "2024-01-08",
    category: "Devotional",
    tags: ["prayer", "spiritual-discipline", "communication"],
    featured: false,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 3,
    title: "Serving Others with Love",
    slug: "serving-others-with-love",
    excerpt:
      "Practical ways to serve your community and demonstrate Christ's love through acts of service and kindness.",
    content: "Jesus taught us that the greatest among us are those who serve...",
    author: "Sarah Wilson",
    date: "2024-01-05",
    category: "Article",
    tags: ["service", "community", "love", "outreach"],
    featured: false,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 4,
    title: "Understanding God's Grace",
    slug: "understanding-gods-grace",
    excerpt: "Explore the depth of God's grace and how it transforms our lives and relationships with others.",
    content: "Grace is the unmerited favor of God...",
    author: "Pastor John Smith",
    date: "2024-01-03",
    category: "Sermon",
    tags: ["grace", "salvation", "transformation"],
    featured: true,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 5,
    title: "Building Strong Families",
    slug: "building-strong-families",
    excerpt: "Biblical principles for creating loving, supportive families that honor God and strengthen communities.",
    content: "The family is the foundation of society...",
    author: "Lisa Brown",
    date: "2024-01-01",
    category: "Article",
    tags: ["family", "relationships", "parenting", "marriage"],
    featured: false,
    image: "/placeholder.svg?height=300&width=500",
  },
]

const categories = ["All", "Devotional", "Sermon", "Article", "Announcement"]
const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags)))

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => post.tags.includes(tag))

    return matchesSearch && matchesCategory && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
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
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100"
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
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600">No articles found matching your criteria.</p>
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
                    className={`h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${post.featured ? "ring-2 ring-blue-200" : ""}`}
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {post.featured && (
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{post.title}</h3>

                      <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

                      <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href={`/blog/${post.slug}`}>Read More</Link>
                      </Button>
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
