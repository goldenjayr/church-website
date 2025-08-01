"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, BookOpen, HandIcon as Hands } from "lucide-react"

const features = [
  {
    icon: Heart,
    title: "Loving Community",
    description: "Experience the warmth of Christian fellowship in a welcoming environment where everyone belongs.",
  },
  {
    icon: Users,
    title: "Growing Together",
    description: "Join small groups, Bible studies, and ministries designed to help you grow in faith and friendship.",
  },
  {
    icon: BookOpen,
    title: "Biblical Teaching",
    description: "Discover God's truth through expository preaching and practical application of Scripture.",
  },
  {
    icon: Hands,
    title: "Serving Others",
    description: "Make a difference in our community through outreach programs and mission opportunities.",
  },
]

export function WelcomeSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Why Choose Divine Jesus Church?</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're more than just a church – we're a family united by faith, hope, and love, committed to growing
            together and serving our community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
