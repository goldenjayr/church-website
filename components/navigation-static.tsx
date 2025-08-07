"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Heart, Calendar, BookOpen, Users, MapPin, User, LogOut, Settings, LayoutDashboard } from "lucide-react"
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

// This component checks for user info in cookies client-side only
export function NavigationStatic() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Check if user cookie exists (client-side only)
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
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

  // Show skeleton nav while mounting
  if (!mounted) {
    return (
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="https://cdn.jsdelivr.net/gh/goldenjayr/divinejesus-files/official-logo.png" alt="Logo" width={48} height={48} priority />
              <span className="font-bold text-xl text-slate-800">Divine Jesus Church</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                  {item.name}
                </Link>
              ))}
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                <Link href="/donate">
                  <Heart className="w-4 h-4 mr-1.5" />
                  Donate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
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
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                    <Link href="/donate">
                      <Heart className="w-4 h-4 mr-1.5" />
                      Donate
                    </Link>
                  </Button>
                  
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
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
                    <Link href="/login" className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                  </Button>
                  
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                    <Link href="/donate">
                      <Heart className="w-4 h-4 mr-1.5" />
                      Donate
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - simplified for brevity */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
