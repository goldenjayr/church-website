import Link from "next/link"
import { Heart, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">Divine Jesus Church</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              A welcoming community of faith, hope, and love. Join us as we grow together in Christ and serve our
              community.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>123 Faith Street, Hope City, HC 12345</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4" />
                <span>info@gracecommunity.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/doctrines" className="text-slate-300 hover:text-white transition-colors">
                  Our Beliefs
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/sermons" className="text-slate-300 hover:text-white transition-colors">
                  Sermons
                </Link>
              </li>
              <li>
                <Link href="/ministries" className="text-slate-300 hover:text-white transition-colors">
                  Ministries
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-slate-300 text-sm">Follow us for updates and inspiration</p>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
          <p>&copy; {new Date().getFullYear()} Divine Jesus Church. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
