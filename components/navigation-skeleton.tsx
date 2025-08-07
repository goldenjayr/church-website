import Link from "next/link"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export function NavigationSkeleton() {
  const navItems = [
    "Home",
    "About", 
    "Doctrines",
    "Blog",
    "Events",
    "Contact",
  ]

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
                key={item}
                href="/"
                className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item}
              </Link>
            ))}
            
            {/* Static donate button - always shown */}
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
              <Link href="/donate">
                <Heart className="w-4 h-4 mr-1.5" />
                Donate
              </Link>
            </Button>
          </div>

          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <div className="w-10 h-10" />
          </div>
        </div>
      </div>
    </nav>
  )
}
