"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { verifyResetToken, resetPassword } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PasswordRequirement {
  text: string
  met: boolean
}

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  const passwordRequirements: PasswordRequirement[] = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains number", met: /\d/.test(password) },
    { text: "Passwords match", met: password === confirmPassword && password !== "" }
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.met)

  useEffect(() => {
    const verifyToken = async () => {
      setVerifying(true)
      try {
        const result = await verifyResetToken(params.token)
        if (result.valid) {
          setTokenValid(true)
          setUserEmail(result.email || "")
        } else {
          setTokenValid(false)
          setError("This password reset link is invalid or has expired.")
        }
      } catch (err) {
        setTokenValid(false)
        setError("Failed to verify reset link.")
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [params.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequirementsMet) {
      setError("Please meet all password requirements")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await resetPassword(params.token, password)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="border-none shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-600">Verifying reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Invalid Reset Link</h2>
                <p className="text-slate-600">{error}</p>
                <div className="pt-4 space-y-3">
                  <Link href="/forgot-password" className="block">
                    <Button className="w-full" variant="outline">
                      Request New Reset Link
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Password Reset Successful!</h2>
                <p className="text-slate-600">
                  Your password has been successfully reset. Redirecting to login...
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      Go to Login Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Create New Password
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {userEmail && (
                <span className="block text-sm">
                  Resetting password for: <strong>{userEmail}</strong>
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Password Requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className="flex items-center text-sm">
                      {req.met ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mr-2" />
                      )}
                      <span className={req.met ? "text-green-600" : "text-slate-500"}>
                        {req.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
                disabled={loading || !allRequirementsMet}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
