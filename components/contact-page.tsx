'use client'
'use client'
import { SiteSettings } from '@prisma/client'
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Youtube } from "lucide-react"
import GoogleMapComponent from "./google-map"
import { TikTokIcon } from './tiktok-icon'

interface IProps {
  settings: SiteSettings
}
export function ContactPage(props: IProps) {
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
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              We'd love to hear from you! Reach out with questions, prayer requests, or just to say hello
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8">Get In Touch</h2>

              <div className="space-y-6 mb-8">
                {settings.contactAddress && (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Address</h3>
                      <p className="text-slate-600">{settings.contactAddress}</p>
                    </div>
                  </div>
                )}

                {settings.contactPhone && (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Phone</h3>
                      <p className="text-slate-600">{settings.contactPhone}</p>
                    </div>
                  </div>
                )}

                {settings.contactEmail && (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Email</h3>
                      <p className="text-slate-600">{settings.contactEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {settings.twitterUrl && (
                    <a
                      href={settings.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {settings.tiktokUrl && (
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                    >
                      <TikTokIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-800">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                          First Name
                        </label>
                        <Input id="firstName" placeholder="Your first name" />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                          Last Name
                        </label>
                        <Input id="lastName" placeholder="Your last name" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone (Optional)
                      </label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                        Subject
                      </label>
                      <Input id="subject" placeholder="What is this regarding?" />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                        Message
                      </label>
                      <Textarea id="message" placeholder="Tell us how we can help you..." rows={5} />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Find Us</h2>
            <p className="text-lg text-slate-600">Located in the heart of Hope City</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-slate-200 rounded-lg h-96"
          >
            <GoogleMapComponent />
          </motion.div>
        </div>
      </section>

      {/* Service Times */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Service Times</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Sabbath Worship</h3>
                  <p className="text-slate-600">Saturdays at 8:00 AM</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Prayer Meeting</h3>
                  <p className="text-slate-600">Wednesdays at 7:00 PM</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Bible Study</h3>
                  <p className="text-slate-600">Sundays at 9:00 PM</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
