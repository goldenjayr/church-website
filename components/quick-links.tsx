"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, Heart, Users, Camera, MessageCircle } from "lucide-react"
import Link from "next/link"

const quickLinks = [
  {
    icon: BookOpen,
    title: "Our Doctrines",
    description: "Learn about our core beliefs and biblical foundations",
    href: "/doctrines",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Daily Blog",
    description: "Read devotionals, articles, and sermon insights",
    href: "/blog",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Calendar,
    title: "Sabbath Schedule",
    description: "View our weekly worship schedule and themes",
    href: "/sabbath-schedule",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Heart,
    title: "Donations",
    description: "Support our ministry through tithes and offerings",
    href: "/donate",
    color: "from-red-500 to-red-600",
  },
  {
    icon: Camera,
    title: "Photo Gallery",
    description: "Browse photos from our church activities and events",
    href: "/gallery",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    icon: Users,
    title: "New Here?",
    description: "Everything you need to know for your first visit",
    href: "/new-here",
    color: "from-indigo-500 to-indigo-600",
  },
]

export function QuickLinks() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Explore Our Ministry</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover the many ways you can connect, grow, and serve in our church community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <Link href={link.href}>
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${link.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <link.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">{link.description}</p>
                    <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                      Learn More →
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
