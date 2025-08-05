"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Camera, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

// Mock data - this would come from your database
const galleryImages = [
  {
    id: 1,
    title: "Sunday Worship Service",
    description: "Our congregation gathered for a beautiful worship service",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "worship",
    eventDate: "2024-01-07",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 2,
    title: "Youth Bible Study",
    description: "Young people studying God's word together",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "youth",
    eventDate: "2024-01-05",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 3,
    title: "Community Outreach",
    description: "Serving meals to those in need in our community",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "outreach",
    eventDate: "2024-01-03",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 4,
    title: "Children's Ministry",
    description: "Kids learning about Jesus through fun activities",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "children",
    eventDate: "2024-01-01",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 5,
    title: "Baptism Ceremony",
    description: "Celebrating new believers in their faith journey",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "baptism",
    eventDate: "2023-12-30",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 6,
    title: "Christmas Celebration",
    description: "Our church family celebrating the birth of Christ",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "events",
    eventDate: "2023-12-25",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 7,
    title: "Music Ministry Practice",
    description: "Our worship team preparing for Sunday service",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "music",
    eventDate: "2023-12-20",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 8,
    title: "Family Fellowship Dinner",
    description: "Church families coming together for a meal and fellowship",
    imageUrl: "/placeholder.svg?height=400&width=600",
    category: "fellowship",
    eventDate: "2023-12-15",
    thumbnailUrl: "/placeholder.svg?height=300&width=400",
  },
]

const categories = ["all", "worship", "youth", "children", "outreach", "baptism", "events", "music", "fellowship"]

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[0] | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredImages =
    selectedCategory === "all" ? galleryImages : galleryImages.filter((img) => img.category === selectedCategory)

  const openLightbox = (image: (typeof galleryImages)[0]) => {
    setSelectedImage(image)
    setCurrentImageIndex(filteredImages.findIndex((img) => img.id === image.id))
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? (currentImageIndex - 1 + filteredImages.length) % filteredImages.length
        : (currentImageIndex + 1) % filteredImages.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(filteredImages[newIndex])
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
              <Camera className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Capturing moments of faith, fellowship, and community in our church family
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`capitalize ${selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}`}
              >
                {category === "all" ? "All Photos" : category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600">No photos found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={image.thumbnailUrl || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 text-slate-800">
                          {image.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-semibold text-sm mb-1">{image.title}</h3>
                        <div className="flex items-center text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(image.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                    onClick={() => navigateImage("prev")}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                    onClick={() => navigateImage("next")}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={selectedImage.imageUrl || "/placeholder.svg"}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{selectedImage.title}</h3>
                    <Badge variant="outline">{selectedImage.category}</Badge>
                  </div>
                  <p className="text-slate-600 mb-3">{selectedImage.description}</p>
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(selectedImage.eventDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Image Counter */}
              {filteredImages.length > 1 && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {currentImageIndex + 1} of {filteredImages.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
