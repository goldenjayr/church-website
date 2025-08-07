"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { requestPasswordReset } from "@/lib/auth-actions"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await requestPasswordReset(email)

      if (result.success) {
        setSuccess(true)
        setEmail("")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Forgot Password?
            </CardTitle>
            <p className="text-slate-600 mt-2">
              No worries! We'll send you reset instructions.
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg text-slate-800">
                    Check your email
                  </h3>
                  <p className="text-slate-600 text-sm">
                    If an account exists with that email address, we've sent a password reset link.
                  </p>
                  <p className="text-slate-500 text-xs mt-4">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="w-full group hover:bg-slate-50 transition-all duration-200"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Try Another Email
                  </Button>
                  <Link href="/login" className="block">
                    <Button 
                      variant="default" 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter the email address associated with your account
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="relative pt-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="w-full group hover:bg-slate-50 transition-all duration-200"
                      type="button"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
