"use client"

import { useState, useEffect, useLayoutEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Heart, Calendar, BookOpen, Users, MapPin, User, LogOut, LayoutDashboard, LogIn, Sparkles } from "lucide-react"
import { logout } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@prisma/client"
import { getOptimizedImageUrl } from "@/lib/cloudinary-client"

const navItems = [
  { name: "Home", href: "/", icon: Heart },
  { name: "About", href: "/about", icon: Users },
  { name: "Doctrines", href: "/doctrines", icon: BookOpen },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Contact", href: "/contact", icon: MapPin },
]

// Cache user data in sessionStorage for instant loading
const USER_CACHE_KEY = 'church_user_data'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedUser(): UserType | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = sessionStorage.getItem(USER_CACHE_KEY)
    if (!cached) return null

    const { user, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(USER_CACHE_KEY)
      return null
    }

    return user
  } catch {
    return null
  }
}

function setCachedUser(user: UserType | null) {
  if (typeof window === 'undefined') return

  try {
    if (user) {
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({
        user,
        timestamp: Date.now()
      }))
    } else {
      sessionStorage.removeItem(USER_CACHE_KEY)
    }
  } catch {
    // Silently fail if sessionStorage is not available
  }
}

export function NavigationOptimized() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(() => getCachedUser())
  const [isLoading, setIsLoading] = useState(!getCachedUser()) // Only load if no cache
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useLayoutEffect(() => {
    setMounted(true)

    // If we have cached user, validate it in background
    // If no cached user, fetch immediately
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setCachedUser(userData)
        } else {
          setUser(null)
          setCachedUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(null)
        setCachedUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Always fetch to validate/update cache
    fetchUser()
  }, [])

  const handleLogout = async () => {
    setCachedUser(null) // Clear cache immediately
    setUser(null)
    await logout()
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.role === "ADMIN" ? "/admin" : "/dashboard"
  }

  const getDashboardLabel = () => {
    if (!user) return "Dashboard"
    return user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"
  }

  // Auth section component with loading state
  const AuthSection = () => {
    // During SSR or initial mount, show nothing to prevent flash
    if (!mounted) {
      return (
        <div className="flex items-center gap-3">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
            <Link href="/donate">
              <Heart className="w-4 h-4 mr-1.5" />
              Donate
            </Link>
          </Button>
        </div>
      )
    }

    // Show loading state only if we're actually loading (no cache)
    if (isLoading) {
      return (
        <div className="flex items-center gap-3">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
            <Link href="/donate">
              <Heart className="w-4 h-4 mr-1.5" />
              Donate
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      )
    }

    // Show user menu or sign in
    return (
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
              <Link href="/donate">
                <Heart className="w-4 h-4 mr-1.5" />
                Donate
              </Link>
            </Button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImage ? getOptimizedImageUrl(user.profileImage, { width: 36, height: 36 }) : undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-sm">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name || "Member"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {getDashboardLabel()}
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "USER" && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
                <Link href="/login" className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </Button>
            </motion.div>

            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
              <Link href="/donate">
                <Heart className="w-4 h-4 mr-1.5" />
                Donate
              </Link>
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex-1 flex items-center space-x-2">
              <Image
                src="https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/official-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="sm:w-12 sm:h-12"
                priority
              />
              <span className="font-bold text-base sm:text-xl text-slate-800 truncate">Divine Jesus Church</span>
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

              <AuthSection />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-white shadow-xl z-50 md:hidden overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/official-logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                  />
                  <span className="font-bold text-lg text-slate-800">Menu</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Profile Section (if logged in) */}
              {mounted && !isLoading && user && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-green-600 text-white text-sm font-medium">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{user.name || "Member"}</p>
                      <p className="text-sm text-slate-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-white hover:bg-slate-50"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="ml-1.5">{user.role === "ADMIN" ? "Admin" : "Dashboard"}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-4">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* CTA Section */}
              <div className="p-4 border-t">
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                  <Link href="/donate" onClick={() => setIsOpen(false)}>
                    <Heart className="w-4 h-4 mr-2" />
                    Make a Donation
                  </Link>
                </Button>
              </div>

              {/* Auth Section */}
              <div className="p-4 border-t">
                {mounted && !isLoading ? (
                  user ? (
                    <div className="space-y-2">
                      {user.role === "USER" && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/profile">
                            <User className="w-4 h-4 mr-2" />
                            My Profile
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                          router.push('/')
                          router.refresh()
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center pb-2">
                        <p className="text-sm text-slate-600 text-center">
                          Join our community
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-center hover:bg-slate-50 transition-all duration-200 border-slate-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/login" className="flex items-center">
                          <LogIn className="w-4 h-4 mr-2" />
                          <span>Sign In</span>
                        </Link>
                      </Button>
                      <div className="relative">
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/signup" className="flex items-center justify-center">
                            <Sparkles className="w-4 h-4 mr-2" />
                            <span className="font-medium">Join Our Community</span>
                          </Link>
                        </Button>
                      </div>
                      <p className="text-xs text-center text-slate-500 pt-1">
                        Get access to member features
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center py-4">
                    <Skeleton className="h-10 w-32 rounded" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t mt-auto">
                <p className="text-xs text-slate-500 text-center">
                  © 2024 Divine Jesus Church
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
