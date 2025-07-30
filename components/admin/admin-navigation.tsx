"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Menu,
  X,
  Home,
  FileText,
  Calendar,
  ImageIcon,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react"
import type { User } from "@/lib/prisma"

interface AdminNavigationProps {
  user: User
  onLogout: () => void
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Doctrines", href: "/admin/doctrines", icon: BookOpen },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminNavigation({ user, onLogout }: AdminNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">Divine Jesus Admin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-sm text-slate-600">Welcome, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-600 hover:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">View Site</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
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
            className="lg:hidden bg-white border-t border-slate-200"
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

              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm text-slate-600">Logged in as {user.name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                  <Link href="/">View Site</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
