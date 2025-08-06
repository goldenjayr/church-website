"use client"
import { SiteSettings } from '@prisma/client'
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Clock, Users, Coffee, Car, Baby, Music } from "lucide-react"
import Link from "next/link"

const whatToExpect = [
  {
    icon: Music,
    title: "Worship Music",
    description: "We begin with 1 hour of contemporary and traditional worship songs",
  },
  {
    icon: Heart,
    title: "Warm Welcome",
    description: "Our greeters will welcome you and help you find everything you need",
  },
  {
    icon: Users,
    title: "Biblical Teaching",
    description: "Our pastor shares practical, Bible-based messages that apply to daily life",
  },
  {
    icon: Coffee,
    title: "Fellowship Time",
    description: "Stay after service for refreshments and to meet our church family",
  },
]

const practicalInfo = [
  {
    icon: Clock,
    title: "Service Length",
    description: "Our services typically last about 4 hours including fellowship time",
  },
  {
    icon: Car,
    title: "Parking",
    description: "Free parking is available in our lot and on surrounding streets",
  },
  {
    icon: Baby,
    title: "Children",
    description: "We have nursery care and children's programs during the service",
  },
  {
    icon: Users,
    title: "Dress Code",
    description: "Come as you are! We welcome casual to formal attire",
  },
]

interface IProps {
  settings: SiteSettings
}

export function NewHerePage(props: IProps) {
  const { settings } = props
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">New Here?</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              We're so glad you're considering visiting us! Here's everything you need to know for your first visit
            </p>
          </motion.div>
        </div>
      </section>

      {/* Welcome Message */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Welcome to Our Family</h2>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              At Divine Jesus Church, we believe that everyone has a place at God's table. Whether you're exploring
              faith for the first time, returning to church after some time away, or looking for a new church home,
              we're excited to welcome you with open arms.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We know that visiting a new church can feel overwhelming, so we've put together this guide to help you
              know what to expect and feel comfortable during your visit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">What to Expect</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Here's a typical flow of our Saturday morning worship service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whatToExpect.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Information */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Practical Information</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to know to feel prepared for your visit
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {practicalInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Times & Location */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">When & Where</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Service Times</h3>
                <div className="space-y-2 text-lg text-slate-600">
                  <p>
                    <strong>Sabbath Worship:</strong> Saturdays at 8:00 AM
                  </p>
                  <p>
                    <strong>Bible Study:</strong> Sundays at 9:00 PM
                  </p>
                  <p>
                    <strong>Prayer Meeting:</strong> Wednesdays at 7:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <MapPin className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Location</h3>
                <div className="space-y-2 text-lg text-slate-600">
                  <p>{settings.contactAddress}</p>
                  <p className="pt-2">
                    <Button variant="outline" asChild>
                      <Link href="/contact">Get Directions</Link>
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Visit?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              We can't wait to meet you! If you have any questions before your visit, don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 bg-transparent"
              >
                <Link href="/events">View Upcoming Events</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Do I need to bring anything?</h3>
                <p className="text-slate-600">
                  Just bring yourself! We provide Bibles, and there's no need to bring anything else. If you prefer to
                  use your own Bible or take notes, feel free to bring those.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">What about my children?</h3>
                <p className="text-slate-600">
                  Children are always welcome in our services! We also offer nursery care for infants and toddlers, and
                  children's church for ages 3-12 during the sermon time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Will I be asked to participate or speak?</h3>
                <p className="text-slate-600">
                  Not at all! You're welcome to participate as much or as little as you're comfortable with. There's no
                  pressure to do anything you don't want to do.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">What if I arrive late?</h3>
                <p className="text-slate-600">
                  No worries! Our ushers will help you find a seat quietly. We understand that life happens, and you're
                  welcome whenever you arrive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
