import { prisma } from "../lib/prisma-client"
import * as bcrypt from "bcryptjs"

async function seedUsersSafe() {
  console.log("🌱 Starting SAFE user seeding...")
  console.log("✅ This script will NOT modify your existing admin@divinejesus.org user")
  console.log("✅ It will only create new test users\n")

  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@divinejesus.org" }
    })

    if (existingAdmin) {
      console.log("✅ Found existing admin user - SKIPPING (not modified)")
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Name: ${existingAdmin.name}`)
      console.log(`   Current password remains unchanged\n`)
    } else {
      // Only create admin if it doesn't exist
      const adminPassword = await bcrypt.hash("admin123", 10)
      const adminUser = await prisma.user.create({
        data: {
          email: "admin@divinejesus.org",
          password: adminPassword,
          name: "Admin User",
          role: "ADMIN",
        },
      })
      console.log("✅ Admin user CREATED:", adminUser.email)
    }

    // Create regular test users (only if they don't exist)
    const testUsers = [
      { email: "user@example.com", name: "John Doe", password: "user123", role: "USER" as const },
      { email: "mary@example.com", name: "Mary Johnson", password: "password123", role: "USER" as const },
      { email: "peter@example.com", name: "Peter Smith", password: "password123", role: "USER" as const },
      { email: "sarah@example.com", name: "Sarah Williams", password: "password123", role: "USER" as const },
    ]

    console.log("Creating test users...")
    for (const userData of testUsers) {
      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existing) {
        console.log(`⏭️  User ${userData.email} already exists - SKIPPING`)
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
          },
        })
        console.log(`✅ Test user CREATED: ${user.email}`)
      }
    }

    console.log("\n🎉 Safe user seeding completed!")
    console.log("\n📝 New users login credentials:")
    console.log("Regular User: user@example.com / user123")
    console.log("Test Users: mary/peter/sarah@example.com / password123")
    console.log("\n⚠️  Your existing admin@divinejesus.org password was NOT changed")
    
  } catch (error) {
    console.error("❌ Error seeding users:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedUsersSafe().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
