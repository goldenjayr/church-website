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
import { getCurrentUser, logout } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@prisma/client"

const navItems = [
  { name: "Home", href: "/", icon: Heart },
  { name: "About", href: "/about", icon: Users },
  { name: "Doctrines", href: "/doctrines", icon: BookOpen },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Events", href: "/events", icon: Calendar },
  // { name: "Gallery", href: "/gallery", icon: Users },
  { name: "Contact", href: "/contact", icon: MapPin },
]

interface IProps {
  user: UserType | null
}

export function NavigationClient(props: IProps) {
  const { user } = props
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.role === "ADMIN" ? "/admin" : "/dashboard"
  }

  const getDashboardLabel = () => {
    if (!user) return "Dashboard"
    return user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"
  }

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
            {/* User Authentication Section - Subtle when logged out */}
        <div className="flex items-center gap-3">
                {user ? (
                  <>
                    {/* Donate button more prominent when logged in */}
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                      <Link href="/donate">
                        <Heart className="w-4 h-4 mr-1.5" />
                        Donate
                      </Link>
                    </Button>

                    {/* User menu */}
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
                    {/* Single, subtle sign in link with user icon */}
                    <Button
                      variant="ghost"
                      asChild
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <Link href="/login" className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                    </Button>

                    {/* Primary CTA - Donate button */}
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
                  {user ? (
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
                  )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
