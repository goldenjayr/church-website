"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  Heart, 
  CalendarPlus,
  CalendarCheck,
  Copy,
  Check,
  Info,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MotionDiv } from "@/components/motion-div"
import { EventRSVPModal } from "@/components/event-rsvp-modal"
import { toast } from "sonner"
import { FacebookShareButton, TwitterShareButton, FacebookMessengerShareButton } from "react-share"
import { FacebookIcon, TwitterIcon, FacebookMessengerIcon } from "react-share"
import type { Event } from "@prisma/client"

interface EventDetailsClientProps {
  event: Event & {
    _count?: {
      rsvps: number
    }
  }
}

export function EventDetailsClient({ event }: EventDetailsClientProps) {
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const currentAttendees = event._count?.rsvps || 0
  const spotsRemaining = event.maxAttendees ? event.maxAttendees - currentAttendees : null

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard!")
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }).catch(() => {
      toast.error("Failed to copy link.")
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites!")
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      >
        {/* Hero Section */}
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
          <MotionDiv
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={event.image || "/placeholder.jpg"}
              alt={event.title}
              layout="fill"
              objectFit="cover"
              className="brightness-50"
            />
          </MotionDiv>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-0 left-0 p-4 md:p-8 z-10">
            <Link href="/events">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border-white/30 transition-all duration-300 group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Events
              </Button>
            </Link>
          </div>

          {/* Title Section */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10">
            <div className="max-w-6xl mx-auto">
              <MotionDiv 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              >
                <Badge 
                  variant="secondary" 
                  className="mb-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 text-white backdrop-blur-sm border-white/20 px-3 py-1"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Community Event
                </Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </MotionDiv>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12 md:px-6 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                  <CardContent className="p-6 md:p-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <Info className="h-6 w-6 text-blue-600" />
                      About this Event
                    </h2>
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 
                                 prose-a:text-blue-600 prose-strong:text-gray-800 dark:prose-strong:text-gray-200
                                 prose-headings:text-gray-900 dark:prose-headings:text-white"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  </CardContent>
                  
                  {/* Action Buttons */}
                  <div className="px-6 pb-6 md:px-10 md:pb-10 flex flex-wrap items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <Popover onOpenChange={(open) => !open && setIsCopied(false)}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors duration-200"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Event
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-center text-sm text-gray-700 dark:text-gray-300 mb-3">
                            Share this Event
                          </h4>
                          <FacebookShareButton url={shareUrl} quote={event.title} className="w-full">
                            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <FacebookIcon size={28} round />
                              <span className="text-sm font-medium">Share on Facebook</span>
                            </div>
                          </FacebookShareButton>
                          <TwitterShareButton url={shareUrl} title={event.title} className="w-full">
                            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <TwitterIcon size={28} round />
                              <span className="text-sm font-medium">Share on X</span>
                            </div>
                          </TwitterShareButton>
                          <FacebookMessengerShareButton url={shareUrl} appId="your-facebook-app-id" className="w-full">
                            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <FacebookMessengerIcon size={28} round />
                              <span className="text-sm font-medium">Share on Messenger</span>
                            </div>
                          </FacebookMessengerShareButton>
                          <Button 
                            variant="ghost" 
                            onClick={copyToClipboard} 
                            className="w-full justify-start p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {isCopied ? (
                              <Check className="w-5 h-5 mr-3 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 mr-3" />
                            )}
                            <span className="text-sm font-medium">
                              {isCopied ? 'Link Copied!' : 'Copy Link'}
                            </span>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleLike}
                      className={`transition-all duration-200 ${
                        isLiked 
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-800" 
                          : "hover:bg-red-50 dark:hover:bg-red-950"
                      }`}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      {isLiked ? "Favorited" : "Add to Favorites"}
                    </Button>
                  </div>
                </Card>
              </MotionDiv>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Event Details
                    </h3>
                    <ul className="space-y-5">
                      <li className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Date</p>
                          <p className="text-gray-600 dark:text-gray-400">{formatDate(event.date)}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                          <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Time</p>
                          <p className="text-gray-600 dark:text-gray-400">{event.time}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                          <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Location</p>
                          <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                        </div>
                      </li>
                      {event.maxAttendees && (
                        <li className="flex items-start gap-4">
                          <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                            <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Attendance</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {spotsRemaining !== null && spotsRemaining > 0 ? (
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {spotsRemaining} spots available
                                </span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  Event is fully booked
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {currentAttendees} registered
                            </p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </MotionDiv>

              {/* RSVP Card */}
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              >
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardContent className="p-8 text-center">
                    <CalendarPlus className="h-12 w-12 mx-auto mb-4 text-white/90" />
                    <h3 className="text-2xl font-bold mb-3">Ready to Join?</h3>
                    <p className="mb-6 text-white/90 text-sm">
                      Reserve your spot and get event updates straight to your inbox.
                    </p>
                    {spotsRemaining !== null && (
                      <p className="mb-4 text-sm font-medium">
                        {spotsRemaining > 0 ? (
                          <span className="text-green-300">
                            🎟️ Only {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} left!
                          </span>
                        ) : (
                          <span className="text-red-300">
                            🔒 This event is at full capacity
                          </span>
                        )}
                      </p>
                    )}
                    <Button 
                      size="lg" 
                      onClick={() => setIsRSVPModalOpen(true)}
                      disabled={spotsRemaining !== null && spotsRemaining <= 0}
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg 
                               transform hover:scale-105 transition-all duration-300 disabled:opacity-50 
                               disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <CalendarCheck className="mr-2 h-5 w-5" />
                      {spotsRemaining !== null && spotsRemaining <= 0 ? "Event Full" : "RSVP Now"}
                    </Button>
                  </CardContent>
                </Card>
              </MotionDiv>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* RSVP Modal */}
      <EventRSVPModal
        eventId={event.id}
        eventTitle={event.title}
        open={isRSVPModalOpen}
        onOpenChange={setIsRSVPModalOpen}
        maxAttendees={event.maxAttendees}
        currentAttendees={currentAttendees}
      />
    </>
  )
}
