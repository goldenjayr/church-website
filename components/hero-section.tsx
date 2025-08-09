"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Radio } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getLiveStreamSettings } from "@/lib/settings-actions"

export function HeroSection() {
  const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(null)
  const [liveStreamActive, setLiveStreamActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getLiveStreamSettings()
        setLiveStreamUrl(settings.liveStreamUrl)
        setLiveStreamActive(settings.liveStreamActive)
      } catch (error) {
        console.error("Failed to load live stream settings:", error)
      } finally {
        setLoading(false)
      }
    }

    // Initial load
    loadSettings()

    // Poll for updates every 30 seconds when live stream is expected to be active
    const interval = setInterval(() => {
      loadSettings()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleWatchLive = () => {
    if (liveStreamUrl && liveStreamActive) {
      window.open(liveStreamUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/hero-church.JPG')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          {`Welcome to `}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Divine Jesus Church
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto"
        >
          A place where faith meets community, and hearts find their home in Christ
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
            <Link href="/new-here">
              Visit Us <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>

          <div className="relative inline-flex">
            <Button
              variant="outline"
              size="lg"
              onClick={handleWatchLive}
              disabled={loading || !liveStreamActive || !liveStreamUrl}
              className={`border-white text-white px-8 py-3 text-lg bg-transparent transition-all duration-300 ${
                liveStreamActive && liveStreamUrl
                  ? "hover:bg-white hover:text-slate-900 animate-pulse hover:animate-none"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {liveStreamActive ? (
                <>
                  <Radio className="mr-2 w-5 h-5 animate-pulse" />
                  Watch Live Now
                </>
              ) : (
                <>
                  <Play className="mr-2 w-5 h-5" />
                  Watch Live
                </>
              )}
            </Button>

            {liveStreamActive && liveStreamUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute -top-1 -right-1"
              >
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Service Times */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-gray-200 mb-2">Join us for worship</p>
          <p className="text-2xl font-semibold">Saturdays at 8:00 AM</p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
