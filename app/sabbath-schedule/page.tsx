"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, BookOpen, Timer } from "lucide-react"
import { useEffect, useState } from "react"

// Mock data for Sabbath schedule
const sabbathSchedule = [
  {
    id: "1",
    date: "2024-01-13",
    theme: "Walking in God's Grace",
    speaker: "Pastor John Smith",
    scripture: "Ephesians 2:8-9",
    notes: "A powerful message about understanding and living in God's amazing grace.",
    published: true,
  },
  {
    id: "2",
    date: "2024-01-20",
    theme: "The Power of Faith",
    speaker: "Elder Mary Johnson",
    scripture: "Hebrews 11:1",
    notes: "Exploring what it means to have faith and how it transforms our lives.",
    published: true,
  },
  {
    id: "3",
    date: "2024-01-27",
    theme: "Love in Action",
    speaker: "Pastor John Smith",
    scripture: "1 John 4:7-8",
    notes: "Practical ways to show God's love to others in our daily lives.",
    published: true,
  },
  {
    id: "4",
    date: "2024-02-03",
    theme: "Hope for Tomorrow",
    speaker: "Guest Speaker: Dr. Sarah Wilson",
    scripture: "Romans 15:13",
    notes: "Finding hope in uncertain times through God's promises.",
    published: true,
  },
]

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-4 text-center">
      <div className="bg-white/20 rounded-lg p-4">
        <div className="text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-sm">Days</div>
      </div>
      <div className="bg-white/20 rounded-lg p-4">
        <div className="text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm">Hours</div>
      </div>
      <div className="bg-white/20 rounded-lg p-4">
        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm">Minutes</div>
      </div>
      <div className="bg-white/20 rounded-lg p-4">
        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm">Seconds</div>
      </div>
    </div>
  )
}

export default function SabbathSchedulePage() {
  // Get next Sabbath (Saturday)
  const getNextSabbath = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSaturday = (6 - dayOfWeek) % 7
    const nextSaturday = new Date(today)
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday))
    nextSaturday.setHours(10, 0, 0, 0) // 10:00 AM
    return nextSaturday
  }

  const nextSabbath = getNextSabbath()
  const currentSchedule =
    sabbathSchedule.find((s) => new Date(s.date).toDateString() === nextSabbath.toDateString()) || sabbathSchedule[0]

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
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Sabbath Schedule</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Join us every Saturday at 10:00 AM for worship, fellowship, and spiritual growth
            </p>
          </motion.div>
        </div>
      </section>

      {/* Countdown to Next Sabbath */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <Timer className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Next Sabbath Service</h2>
            <p className="text-xl mb-8">
              {nextSabbath.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at 10:00 AM
            </p>
            <CountdownTimer targetDate={nextSabbath} />

            {currentSchedule && (
              <div className="mt-8 bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-2">{currentSchedule.theme}</h3>
                <p className="text-lg mb-2">Speaker: {currentSchedule.speaker}</p>
                <p className="text-blue-200">Scripture: {currentSchedule.scripture}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Schedule List */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Upcoming Services</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Plan ahead and see what inspiring messages await in our upcoming Sabbath services
            </p>
          </motion.div>

          <div className="space-y-6">
            {sabbathSchedule.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-slate-800">{service.theme}</CardTitle>
                          <div className="flex items-center space-x-4 text-slate-600 mt-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(service.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>10:00 AM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="self-start md:self-center">
                        Sabbath Service
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-slate-600" />
                          <span className="font-semibold text-slate-800">Speaker:</span>
                        </div>
                        <p className="text-slate-600 mb-4">{service.speaker}</p>

                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="w-4 h-4 text-slate-600" />
                          <span className="font-semibold text-slate-800">Scripture:</span>
                        </div>
                        <p className="text-blue-600 font-medium">{service.scripture}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Service Notes:</h4>
                        <p className="text-slate-600 leading-relaxed">{service.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Info */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Service Information</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Service Time</h3>
                <p className="text-slate-600">Saturdays at 10:00 AM</p>
              </div>
              <div className="text-center">
                <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Duration</h3>
                <p className="text-slate-600">Approximately 2 hours</p>
              </div>
              <div className="text-center">
                <User className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">All Welcome</h3>
                <p className="text-slate-600">Everyone is invited</p>
              </div>
            </div>
            <p className="text-lg text-slate-600 mb-6">
              Our Sabbath services include worship music, prayer, and inspiring biblical messages. Come as you are and
              experience God's love in our welcoming community.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
