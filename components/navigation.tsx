"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, Calendar, BookOpen, Users, MapPin } from "lucide-react"

const navItems = [
  { name: "Home", href: "/", icon: Heart },
  { name: "About", href: "/about", icon: Users },
  { name: "Doctrines", href: "/doctrines", icon: BookOpen },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Gallery", href: "/gallery", icon: Users },
  { name: "Contact", href: "/contact", icon: MapPin },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            </div> */}
              <Image src="https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/official-logo.png" alt="Logo" width={48} height={48} />
            <span className="font-bold text-xl text-slate-800">Divine Jesus Church</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/donate">Donate</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/donate">Donate</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
