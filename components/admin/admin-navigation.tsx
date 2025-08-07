"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Crown,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { User } from "@/lib/prisma"

interface AdminNavigationProps {
  user: User
  onLogout: () => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Events", href: "/admin/events", icon: Calendar },
  // { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Doctrines", href: "/admin/doctrines", icon: BookOpen },
  { name: "Members", href: "/admin/members", icon: Crown },
  { name: "Positions", href: "/admin/positions", icon: Crown },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminNavigation({ user, onLogout, isCollapsed, setIsCollapsed }: AdminNavigationProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-slate-800">Divine Jesus</h1>
                  <p className="text-xs text-slate-500">Admin Panel</p>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log('Collapse button clicked, setIsCollapsed:', typeof setIsCollapsed)
                if (typeof setIsCollapsed === 'function') {
                  setIsCollapsed(!isCollapsed)
                } else {
                  console.error('setIsCollapsed is not a function:', setIsCollapsed)
                }
              }}
              className="ml-auto"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-blue-600" : ""}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
                {isCollapsed && isActive(item.href) && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                    {getInitials(user.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                    {getInitials(user.name || 'U')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Logout" className="w-full">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-xl"
            >
              <div className="p-6 border-b border-slate-200">
                <Link href="/admin" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-slate-800">Divine Jesus</h1>
                    <p className="text-xs text-slate-500">Admin Panel</p>
                  </div>
                </Link>
              </div>

              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-blue-600" : ""}`} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                        {getInitials(user.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start">
                      <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        View Site
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLogout}
                      className="w-full justify-start text-slate-600 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
