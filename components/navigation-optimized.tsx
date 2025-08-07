"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Heart, Calendar, BookOpen, Users, MapPin, User, LogOut, LayoutDashboard } from "lucide-react"
import { logout } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@prisma/client"

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

  useEffect(() => {
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
    router.push("/")
    router.refresh()
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
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/official-logo.png" 
              alt="Logo" 
              width={48} 
              height={48} 
              priority 
            />
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
            
            <AuthSection />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Show user avatar on mobile if logged in */}
            {mounted && !isLoading && user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}
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
              
              {/* Mobile User Authentication Section */}
              <div className="px-3 py-2 border-t border-slate-200">
                {mounted && !isLoading ? (
                  user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-md">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{user.name || "User"}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        asChild 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={getDashboardLink()}>
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {getDashboardLabel()}
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        asChild 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/signup">Create Account</Link>
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center py-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
