'use server'

import { prisma } from '@/lib/prisma-client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { User, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { RedisService, CacheKeys, CacheTTL } from '@/lib/services/redis.service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return null
    }

    // Compare the password with the hashed password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return null
    }

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: Role = 'USER'
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    })

    return {
      success: true,
      message: 'User registered successfully',
      user
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      message: 'Failed to register user'
    }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value
    const userId = cookieStore.get('userId')?.value // Fallback for backward compatibility

    // Try to get user from session first (Redis)
    if (sessionId) {
      const session = await RedisService.getSession<{ userId: string; user: User }>(sessionId)
      if (session?.user) {
        return session.user
      }
    }

    // Fallback to userId cookie if no session
    if (!userId) {
      return null
    }

    // Check Redis cache for user data
    const cacheKey = CacheKeys.userAuth(userId)
    const cachedUser = await RedisService.get<User>(cacheKey)
    if (cachedUser) {
      return cachedUser
    }

    // Get from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user) {
      // Cache user data (without password)
      const { password, ...userWithoutPassword } = user
      await RedisService.set(cacheKey, userWithoutPassword, CacheTTL.HOUR)
    }

    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function setCurrentUser(user: User | null) {
  const cookieStore = await cookies()

  if (user) {
    // Create Redis session
    const { password, ...userWithoutPassword } = user
    const sessionId = await RedisService.setSession(
      user.id,
      { user: userWithoutPassword },
      CacheTTL.DAY * 30 // 30 days
    )

    // Set session cookie
    cookieStore.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    // Keep userId for backward compatibility
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    // Cache user auth data
    await RedisService.set(CacheKeys.userAuth(user.id), userWithoutPassword, CacheTTL.HOUR)
  } else {
    // Clear session and cookies
    const sessionId = cookieStore.get('sessionId')?.value
    if (sessionId) {
      await RedisService.deleteSession(sessionId)
    }
    cookieStore.delete('sessionId')
    cookieStore.delete('userId')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  
  // Delete Redis session
  const sessionId = cookieStore.get('sessionId')?.value
  if (sessionId) {
    await RedisService.deleteSession(sessionId)
  }
  
  // Clear user cache
  const userId = cookieStore.get('userId')?.value
  if (userId) {
    await RedisService.delete(CacheKeys.userAuth(userId))
  }
  
  cookieStore.delete('sessionId')
  cookieStore.delete('userId')
  redirect('/login')
}

export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      }
    }

    // Generate a secure random token
    const crypto = await import('crypto')
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })

    // Send password reset email
    const { sendPasswordResetEmail } = await import('@/lib/email-service')
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password/${token}`

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name || undefined,
      resetLink
    })

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return {
      success: false,
      message: 'Failed to process password reset request'
    }
  }
}

export async function verifyResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
}> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return { valid: false }
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return { valid: false }
    }

    // Check if token has been used
    if (resetToken.used) {
      return { valid: false }
    }

    return {
      valid: true,
      email: resetToken.user.email
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return { valid: false }
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Verify token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return {
        success: false,
        message: 'Invalid or expired reset token'
      }
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return {
        success: false,
        message: 'This password reset link has expired'
      }
    }

    // Check if token has been used
    if (resetToken.used) {
      return {
        success: false,
        message: 'This password reset link has already been used'
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ])

    // Send confirmation email
    const { sendPasswordResetSuccessEmail } = await import('@/lib/email-service')
    await sendPasswordResetSuccessEmail({
      to: resetToken.user.email,
      name: resetToken.user.name || undefined
    })

    return {
      success: true,
      message: 'Password has been reset successfully'
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      message: 'Failed to reset password'
    }
  }
}
