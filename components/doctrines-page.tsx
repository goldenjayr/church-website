"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, BookOpen, ExternalLink, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getPublishedDoctrines, getDoctrineCategories } from "@/lib/public-doctrine-actions"
import { getFeaturedBlogPosts } from "@/lib/public-blog-actions"
import type { Doctrine } from "@prisma/client"

interface DoctrineCategory {
  name: string
  doctrines: Doctrine[]
}

interface IProps {
  doctrineCategories: DoctrineCategory[]
  featuredBlogs: any
}

export function DoctrinesPage(props: IProps) {
  const { doctrineCategories, featuredBlogs } = props
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const filteredCategories = doctrineCategories.map(category => ({
    ...category,
    doctrines: category.doctrines.filter(doctrine =>
      doctrine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctrine.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.doctrines.length > 0)

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
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Doctrines</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Discover the biblical foundations that guide our faith and shape our community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search doctrines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Doctrines Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No doctrines found</h3>
              <p className="text-slate-500">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredCategories.map((category, categoryIndex) => (
              <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">{category.name}</h2>

              <div className="space-y-4">
                {category.doctrines.map((doctrine, index) => (
                  <Card key={doctrine.id} className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full p-6 h-auto justify-between text-left hover:bg-slate-50"
                        onClick={() => toggleExpanded(doctrine.id)}
                      >
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-2">{doctrine.title}</h3>
                        </div>
                        {expandedItems.includes(doctrine.id) ? (
                          <ChevronUp className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        )}
                      </Button>

                      <AnimatePresence>
                        {expandedItems.includes(doctrine.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-0">
                              <div className="h-px bg-slate-200 mb-6" />

                              {/* Main Content */}
                              <div
                                className="prose prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-800 prose-ul:text-slate-700 prose-ol:text-slate-700 mb-6"
                                dangerouslySetInnerHTML={{ __html: doctrine.content }}
                              />

                              {/* Related Articles */}
                              {featuredBlogs.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Featured Articles:</h4>
                                  <div className="space-y-3">
                                    {featuredBlogs.slice(0, 2).map((blog: any) => (
                                      <div key={blog.slug} className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-slate-800 mb-1">{blog.title}</h5>
                                            <p className="text-sm text-slate-600 mb-2">{blog.excerpt || 'No excerpt available'}</p>
                                          </div>
                                          <Button asChild size="sm" variant="ghost" className="ml-4">
                                            <Link href={`/blog/${blog.slug}`}>
                                              <FileText className="w-4 h-4 mr-1" />
                                              Read
                                              <ExternalLink className="w-3 h-3 ml-1" />
                                            </Link>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Have Questions About Our Beliefs?</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              We'd love to discuss these doctrines with you and answer any questions you might have about our faith.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Link href="/contact">Contact Our Pastors</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                <Link href="/blog">Read More Articles</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
