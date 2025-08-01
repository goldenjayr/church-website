"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, CreditCard, Smartphone, Building, Globe, Shield, Users, BookOpen } from "lucide-react"

const donationCategories = [
  {
    id: "tithes",
    title: "Tithes & Offerings",
    description: "Support our regular church operations and ministries",
    icon: Heart,
    color: "from-blue-500 to-blue-600",
    suggested: [50, 100, 250, 500],
  },
  {
    id: "missions",
    title: "Mission Fund",
    description: "Help spread the gospel through local and global missions",
    icon: Globe,
    color: "from-green-500 to-green-600",
    suggested: [25, 75, 150, 300],
  },
  {
    id: "building",
    title: "Building Fund",
    description: "Contribute to church maintenance and facility improvements",
    icon: Building,
    color: "from-purple-500 to-purple-600",
    suggested: [100, 250, 500, 1000],
  },
  {
    id: "youth",
    title: "Youth Ministry",
    description: "Support programs and activities for our young people",
    icon: Users,
    color: "from-red-500 to-red-600",
    suggested: [30, 60, 120, 250],
  },
  {
    id: "education",
    title: "Christian Education",
    description: "Fund Bible studies, seminars, and educational materials",
    icon: BookOpen,
    color: "from-yellow-500 to-yellow-600",
    suggested: [20, 50, 100, 200],
  },
]

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Secure online payment with Visa, MasterCard, or American Express",
    icon: CreditCard,
    color: "bg-blue-600",
  },
  {
    id: "gcash",
    name: "GCash",
    description: "Send donations via GCash mobile wallet",
    icon: Smartphone,
    color: "bg-green-600",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank deposit or online transfer",
    icon: Building,
    color: "bg-purple-600",
  },
]

export default function DonatePage() {
  const [selectedCategory, setSelectedCategory] = useState("tithes")
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState("monthly")

  const selectedCategoryData = donationCategories.find((cat) => cat.id === selectedCategory)

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString())
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setAmount("")
  }

  const getFinalAmount = () => {
    return customAmount || amount
  }

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

      {/* Donation Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-none shadow-xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-slate-800">Make a Donation</CardTitle>
                <p className="text-slate-600 mt-2">Choose your donation category and amount</p>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-8">
                  {/* Donation Category */}
                  <div>
                    <Label className="text-lg font-semibold text-slate-800 mb-4 block">Choose Donation Category</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {donationCategories.map((category) => (
                        <div
                          key={category.id}
                          className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                            selectedCategory === category.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center flex-shrink-0`}
                            >
                              <category.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-800 mb-1">{category.title}</h3>
                              <p className="text-sm text-slate-600">{category.description}</p>
                            </div>
                          </div>
                          {selectedCategory === category.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <Label className="text-lg font-semibold text-slate-800 mb-4 block">Select Amount</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {selectedCategoryData?.suggested.map((suggestedAmount) => (
                        <Button
                          key={suggestedAmount}
                          type="button"
                          variant={amount === suggestedAmount.toString() ? "default" : "outline"}
                          className={`h-12 ${
                            amount === suggestedAmount.toString() ? "bg-blue-600 hover:bg-blue-700" : ""
                          }`}
                          onClick={() => handleAmountSelect(suggestedAmount)}
                        >
                          ${suggestedAmount}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <Label htmlFor="customAmount" className="text-sm font-medium text-slate-700 mb-2 block">
                        Or enter custom amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          id="customAmount"
                          type="number"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="pl-8"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recurring Donation */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                      />
                      <Label htmlFor="recurring" className="text-sm font-medium text-slate-700">
                        Make this a recurring donation
                      </Label>
                    </div>
                    {isRecurring && (
                      <RadioGroup value={frequency} onValueChange={setFrequency} className="ml-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly">Weekly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly">Monthly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quarterly" id="quarterly" />
                          <Label htmlFor="quarterly">Quarterly</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label className="text-lg font-semibold text-slate-800 mb-4 block">Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                              paymentMethod === method.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className={`w-10 h-10 ${method.color} rounded-full flex items-center justify-center`}>
                              <method.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <Label htmlFor={method.id} className="font-semibold text-slate-800 cursor-pointer">
                                {method.name}
                              </Label>
                              <p className="text-sm text-slate-600">{method.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Donor Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 mb-2 block">
                        First Name *
                      </Label>
                      <Input id="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 mb-2 block">
                        Last Name *
                      </Label>
                      <Input id="lastName" required />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">
                        Email Address *
                      </Label>
                      <Input id="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-2 block">
                        Phone Number
                      </Label>
                      <Input id="phone" type="tel" />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-slate-700 mb-2 block">
                      Special Instructions or Prayer Requests (Optional)
                    </Label>
                    <Textarea id="message" placeholder="Any special instructions or prayer requests..." rows={3} />
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Secure Donation</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your donation is processed securely using industry-standard encryption. We never store your
                      payment information.
                    </p>
                  </div>

                  {/* Donation Summary */}
                  {getFinalAmount() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-800 mb-3">Donation Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="font-medium">{selectedCategoryData?.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-medium">${getFinalAmount()}</span>
                        </div>
                        {isRecurring && (
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span className="font-medium capitalize">{frequency}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-medium">
                            {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
                    disabled={!getFinalAmount()}
                  >
                    {isRecurring ? `Set Up ${frequency} Donation` : "Donate Now"} - ${getFinalAmount() || "0.00"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Your Impact</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every donation, no matter the size, makes a real difference in our community and beyond
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
                <p className="text-slate-600">Families Served Monthly</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">25</div>
                <p className="text-slate-600">Active Ministries</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">12</div>
                <p className="text-slate-600">Mission Projects</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-red-600 mb-2">500+</div>
                <p className="text-slate-600">Lives Touched</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
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
                <h3 className="text-xl font-bold text-slate-800 mb-3">Is my donation tax-deductible?</h3>
                <p className="text-slate-600">
                  Yes, Divine Jesus Church is a registered non-profit organization. You will receive a tax receipt for
                  your donation that you can use for tax deduction purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">How is my donation used?</h3>
                <p className="text-slate-600">
                  Your donations support various church ministries, community outreach programs, facility maintenance,
                  and mission work. We provide annual financial reports showing how donations are allocated.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Can I cancel my recurring donation?</h3>
                <p className="text-slate-600">
                  Yes, you can cancel or modify your recurring donation at any time by contacting our finance team or
                  through your donor portal account.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Is online giving secure?</h3>
                <p className="text-slate-600">
                  Absolutely. We use industry-standard SSL encryption and work with trusted payment processors to ensure
                  your financial information is completely secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
