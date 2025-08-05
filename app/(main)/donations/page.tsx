"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, CreditCard, Smartphone, Building, Globe } from "lucide-react"

const donationCategories = [
  {
    title: "Tithes & Offerings",
    description: "Support our regular church operations and ministries",
    icon: Heart,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Mission Fund",
    description: "Help spread the gospel through local and global missions",
    icon: Globe,
    color: "from-green-500 to-green-600",
  },
  {
    title: "Building Fund",
    description: "Contribute to church maintenance and facility improvements",
    icon: Building,
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Special Projects",
    description: "Support specific ministry initiatives and community outreach",
    icon: Heart,
    color: "from-red-500 to-red-600",
  },
]

const paymentMethods = [
  {
    name: "GCash",
    description: "Send donations via GCash mobile wallet",
    details: "Account: 09XX-XXX-XXXX\nName: Grace Community Church",
    icon: Smartphone,
    color: "bg-blue-600",
  },
  {
    name: "PayPal",
    description: "Secure online donations through PayPal",
    details: "Email: donations@gracecommunity.org",
    icon: CreditCard,
    color: "bg-yellow-500",
  },
  {
    name: "Bank Transfer",
    description: "Direct bank deposit or transfer",
    details: "Bank: First National Bank\nAccount: 1234-5678-9012\nName: Grace Community Church",
    icon: Building,
    color: "bg-green-600",
  },
]

export default function DonationsPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Give with Joy</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Your generous giving helps us serve our community and spread God's love
            </p>
            <blockquote className="text-lg italic text-blue-100">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion,
              for God loves a cheerful giver."
            </blockquote>
            <cite className="text-blue-200 text-sm">— 2 Corinthians 9:7</cite>
          </motion.div>
        </div>
      </section>

      {/* Donation Categories */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Ways to Give</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose how you'd like to support our ministry and make a difference in our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {donationCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mb-4`}
                    >
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{category.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">{category.description}</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Give Now</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Payment Methods</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We accept various payment methods to make giving convenient and secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg">
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-800">{method.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-slate-600 mb-4">{method.description}</p>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-line">
                      {method.details}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Your Impact</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Every donation, no matter the size, makes a real difference in our community and beyond
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
                <p className="text-slate-600">Families Served Monthly</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">25</div>
                <p className="text-slate-600">Active Ministries</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">12</div>
                <p className="text-slate-600">Mission Projects</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Questions About Giving?</h3>
              <p className="text-slate-600 mb-6">
                We're here to help! If you have any questions about donations, tax receipts, or how your gifts are used,
                please don't hesitate to contact us.
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Contact Our Finance Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
