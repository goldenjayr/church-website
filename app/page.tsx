"use client"

import { motion } from "framer-motion"
import { HeroSection } from "@/components/hero-section"
import { VerseOfTheDay } from "@/components/verse-of-the-day"
import { UpcomingEvents } from "@/components/upcoming-events"
import { QuickLinks } from "@/components/quick-links"
import { WelcomeSection } from "@/components/welcome-section"

export default function HomePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <HeroSection />
      <VerseOfTheDay />
      <WelcomeSection />
      <QuickLinks />
      <UpcomingEvents />
    </motion.div>
  )
}
