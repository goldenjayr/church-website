"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  ExternalLink, 
  FileText, 
  Search,
  Grid3x3,
  List,
  Layers,
  Share2,
  Printer,
  Bookmark,
  Clock,
  Hash,
  ChevronRight,
  Menu,
  X,
  Heart,
  Cross,
  Sparkles,
  Shield,
  Book,
  ScrollText,
  Church
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getPublishedDoctrines, getDoctrineCategories } from "@/lib/public-doctrine-actions"
import { getFeaturedBlogPosts } from "@/lib/public-blog-actions"
import type { Doctrine } from "@prisma/client"
import { cn } from "@/lib/utils"

interface DoctrineCategory {
  name: string
  doctrines: Doctrine[]
}

interface IProps {
  doctrineCategories: DoctrineCategory[]
  featuredBlogs: any
}

import "@/styles/blog-content.css"

// Icon mapping for categories
const categoryIcons: { [key: string]: any } = {
  "Core Beliefs": Cross,
  "Salvation": Heart,
  "Scripture": Book,
  "Church": Church,
  "Prophecy": ScrollText,
  "default": Shield
}

export function DoctrinesPage(props: IProps) {
  const { doctrineCategories, featuredBlogs } = props
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"accordion" | "cards" | "full">("accordion")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")  
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const expandAll = () => {
    const allIds = doctrineCategories.flatMap(cat => cat.doctrines.map(d => d.id))
    setExpandedItems(allIds)
  }

  const collapseAll = () => {
    setExpandedItems([])
  }

  const filteredCategories = doctrineCategories
    .filter(category => selectedCategory === "all" || category.name === selectedCategory)
    .map(category => ({
      ...category,
      doctrines: category.doctrines.filter(doctrine =>
        doctrine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctrine.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.doctrines.length > 0)

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return minutes
  }

  // Get total count
  const totalDoctrines = filteredCategories.reduce((acc, cat) => acc + cat.doctrines.length, 0)

  // Handle scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      
      for (const category of doctrineCategories) {
        for (const doctrine of category.doctrines) {
          const element = contentRefs.current[doctrine.id]
          if (element) {
            const { offsetTop, offsetHeight } = element
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(doctrine.id)
              return
            }
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [doctrineCategories])

  const scrollToSection = (id: string) => {
    contentRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setShowMobileSidebar(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* Enhanced Hero Section */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div 
              className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </motion.div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-6">Our Doctrines</h1>
            <p className="text-base sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto px-2">
              Discover the biblical foundations that guide our faith and shape our community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Search and Filters Section */}
      <section className="sticky top-14 sm:top-16 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="pt-3 pb-2 sm:pt-4 sm:pb-3 space-y-2 sm:space-y-2.5">
            {/* Top Row - View Controls and Search */}
            <div className="flex gap-2">
              {/* View Mode Toggle - Always visible */}
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                <Button
                  variant={viewMode === "accordion" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("accordion")}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  title="Accordion View"
                >
                  <List className="w-4 h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">List</span>
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  title="Cards View"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">Cards</span>
                </Button>
                <Button
                  variant={viewMode === "full" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("full")}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  title="Full View"
                >
                  <Layers className="w-4 h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">Full</span>
                </Button>
              </div>
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-9 h-8 sm:h-9 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Category Filters - Horizontal scroll on mobile */}
            <div className="-mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                <button
                  className={cn(
                    "inline-flex items-center cursor-pointer transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    "py-1 px-2.5 rounded-md text-xs font-medium border",
                    selectedCategory === "all"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700 hover:border-blue-700"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  )}
                  onClick={() => setSelectedCategory("all")}
                >
                  All ({doctrineCategories.reduce((acc, cat) => acc + cat.doctrines.length, 0)})
                </button>
                {doctrineCategories.map((category) => {
                  const Icon = categoryIcons[category.name] || categoryIcons.default
                  return (
                    <button
                      key={category.name}
                      className={cn(
                        "inline-flex items-center cursor-pointer transition-all duration-200 whitespace-nowrap flex-shrink-0",
                        "py-1 px-2.5 rounded-md text-xs font-medium border",
                        selectedCategory === category.name
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700 hover:border-blue-700"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      )}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="ml-0.5 opacity-75">({category.doctrines.length})</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Results and Actions - Only show in accordion mode */}
            {viewMode === "accordion" && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600">
                  <span className="font-semibold">{totalDoctrines}</span>
                  <span className="hidden sm:inline"> doctrine{totalDoctrines !== 1 ? 's' : ''}</span>
                  <span className="sm:hidden"> found</span>
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAll}
                    className="text-xs h-6 px-2"
                  >
                    <ChevronDown className="w-3 h-3 mr-0.5" />
                    <span className="hidden sm:inline">Expand</span> All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAll}
                    className="text-xs h-6 px-2"
                  >
                    <ChevronUp className="w-3 h-3 mr-0.5" />
                    <span className="hidden sm:inline">Collapse</span> All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setShowMobileSidebar(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 lg:hidden"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Table of Contents</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileSidebar(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(100vh-73px)]">
                <div className="p-4">
                  {doctrineCategories.map((category, idx) => {
                    const Icon = categoryIcons[category.name] || categoryIcons.default
                    return (
                      <div key={category.name} className={cn(
                        "pb-4",
                        idx !== doctrineCategories.length - 1 && "border-b mb-4"
                      )}>
                        <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center">
                          <Icon className="w-4 h-4 mr-2 text-blue-600" />
                          {category.name}
                        </h4>
                        <div className="space-y-0.5">
                          {category.doctrines.map((doctrine) => (
                            <button
                              key={doctrine.id}
                              onClick={() => scrollToSection(doctrine.id)}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                                activeSection === doctrine.id
                                  ? "bg-blue-50 text-blue-700 font-medium border-l-3 border-blue-600"
                                  : "text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                              )}
                            >
                              {doctrine.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Doctrines Content */}
      <section className="py-4 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-36 sm:top-40 bg-white rounded-lg shadow-md p-4 max-h-[calc(100vh-160px)] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4">Table of Contents</h3>
                {doctrineCategories.map((category) => {
                  const Icon = categoryIcons[category.name] || categoryIcons.default
                  return (
                    <div key={category.name} className="mb-6">
                      <h4 className="font-semibold text-sm text-slate-600 mb-2 flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </h4>
                      <div className="space-y-1 ml-6">
                        {category.doctrines.map((doctrine) => (
                          <button
                            key={doctrine.id}
                            onClick={() => scrollToSection(doctrine.id)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                              activeSection === doctrine.id
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {doctrine.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </aside>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No doctrines found</h3>
                  <p className="text-slate-500">Try adjusting your search terms</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : viewMode === "cards" ? (
                /* Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  {filteredCategories.map((category) => {
                    const CategoryIcon = categoryIcons[category.name] || categoryIcons.default
                    return category.doctrines.map((doctrine) => (
                      <motion.div
                        key={doctrine.id}
                        ref={(el) => { contentRefs.current[doctrine.id] = el }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="touch-manipulation"
                      >
                        <Card className="h-full hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
                          <CardHeader className="pb-3 px-4 sm:px-6">
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                                <span className="hidden sm:inline">{category.name}</span>
                              </Badge>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                <Clock className="w-3 h-3 mr-1" />
                                {calculateReadingTime(doctrine.content)} min
                              </Badge>
                            </div>
                            <CardTitle className="text-base sm:text-lg line-clamp-2">{doctrine.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 sm:px-6">
                            <div 
                              className="text-sm text-slate-600 line-clamp-3 sm:line-clamp-4 mb-4"
                              dangerouslySetInnerHTML={{ 
                                __html: doctrine.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...' 
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewMode("accordion")
                                setExpandedItems([doctrine.id])
                                setTimeout(() => scrollToSection(doctrine.id), 100)
                              }}
                              className="w-full h-9 sm:h-10"
                            >
                              Read Full Doctrine
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  })}
                </div>
              ) : viewMode === "full" ? (
                /* Full View */
                <div className="space-y-12">
                  {filteredCategories.map((category, categoryIndex) => {
                    const CategoryIcon = categoryIcons[category.name] || categoryIcons.default
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="mb-8">
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 flex items-center justify-center">
                            <CategoryIcon className="w-6 h-6 mr-3 text-blue-600" />
                            {category.name}
                          </h2>
                          <div className="space-y-8">
                            {category.doctrines.map((doctrine, index) => (
                              <Card 
                                key={doctrine.id} 
                                ref={(el) => { contentRefs.current[doctrine.id] = el }}
                                className="overflow-hidden"
                              >
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
                                      {doctrine.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Clock className="w-4 h-4" />
                                      <span>{calculateReadingTime(doctrine.content)} min read</span>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                  <div
                                    className="blog-content prose prose-lg max-w-none"
                                    dangerouslySetInnerHTML={{ __html: doctrine.content }}
                                  />
                                  
                                  {/* Share buttons */}
                                  <div className="mt-6 pt-6 border-t flex items-center justify-between">
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <Bookmark className="w-4 h-4 mr-2" />
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                /* Accordion View (Default) */
                filteredCategories.map((category, categoryIndex) => {
                  const CategoryIcon = categoryIcons[category.name] || categoryIcons.default
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="mb-12"
                    >
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 flex items-center">
                        <CategoryIcon className="w-6 h-6 mr-3 text-blue-600" />
                        {category.name}
                      </h2>

                      <div className="space-y-4">
                        {category.doctrines.map((doctrine, index) => (
                          <Card 
                            key={doctrine.id} 
                            ref={(el) => { contentRefs.current[doctrine.id] = el }}
                            className="border-none shadow-md sm:shadow-lg overflow-hidden touch-manipulation"
                          >
                    <CardContent className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full p-4 sm:p-6 h-auto justify-between text-left hover:bg-slate-50 active:bg-slate-100"
                        onClick={() => toggleExpanded(doctrine.id)}
                      >
                        <div className="flex-1 mr-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 line-clamp-2">{doctrine.title}</h3>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedItems.includes(doctrine.id) ? (
                            <ChevronUp className="w-5 h-5 text-slate-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
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
                            <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0">
                              <div className="h-px bg-slate-200 mb-4 sm:mb-6" />

                              {/* Main Content */}
                              <div
                                className="blog-content prose prose-sm sm:prose-lg max-w-none"
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
                  )
                })
              )}
            </div>
          </div>
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
