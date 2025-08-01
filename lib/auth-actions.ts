"use server"

import { prisma } from "@/lib/prisma-client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { User } from "@prisma/client"

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user && user.password === password) {
      // In production, you would properly hash and compare passwords
      return user
    }

    return null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
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