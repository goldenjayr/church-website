import Link from "next/link"
import { Heart, MapPin, Phone, Mail, Facebook, Twitter, Youtube } from "lucide-react"
import { getSiteSettings } from '@/lib/settings-actions'

export async function Footer() {
  const settings = await getSiteSettings()


  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt={`${settings.siteName} Logo`} className="w-6 h-6 rounded-full" />
                ) : (
                  <Heart className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-bold text-xl">{settings.siteName || "Divine Jesus Church"}</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              A welcoming community of faith, hope, and love. Join us as we grow together in Christ and serve our
              community.
            </p>
            <div className="space-y-2">
              {settings.contactAddress && (
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4" />
                  <span>{settings.contactAddress}</span>
                </div>
              )}
              {settings.contactPhone && (
                <div className="flex items-center space-x-2 text-slate-300">
                  <Phone className="w-4 h-4" />
                  <span>{settings.contactPhone}</span>
                </div>
              )}
              {settings.contactEmail && (
                <div className="flex items-center space-x-2 text-slate-300">
                  <Mail className="w-4 h-4" />
                  <span>{settings.contactEmail}</span>
                </div>
              )}
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
                <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-tiktok" viewBox="0 0 16 16"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>
                </a>
              )}
            </div>
            <p className="text-slate-300 text-sm">Follow us for updates and inspiration</p>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
          <p>&copy; {new Date().getFullYear()} {settings.siteName || "Divine Jesus Church"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
