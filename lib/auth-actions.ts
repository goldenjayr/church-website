"use server"

import { prisma } from "@/lib/prisma-client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { User, Role } from "@prisma/client"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
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
    console.error("Authentication error:", error)
    return null
  }
}

export async function registerUser(
  email: string, 
  password: string, 
  name: string,
  role: Role = "USER"
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { 
        success: false, 
        message: "User with this email already exists" 
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
        role,
      },
    })

    return {
      success: true,
      message: "User registered successfully",
      user,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "Failed to register user",
    }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function setCurrentUser(user: User | null) {
  const cookieStore = await cookies()
  
  if (user) {
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
  } else {
    cookieStore.delete("userId")
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  redirect("/admin")
}