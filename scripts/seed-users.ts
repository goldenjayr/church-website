import { prisma } from "../lib/prisma-client"
import * as bcrypt from "bcryptjs"

async function seedUsers() {
  console.log("🌱 Starting user seeding...")
  console.log("⚠️  This script will create or update specific test users only.")
  console.log("⚠️  No other data will be affected.\n")

  try {
    // First, check what users already exist
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: [
            "admin@divinejesus.org",
            "user@example.com",
            "mary@example.com",
            "peter@example.com",
            "sarah@example.com"
          ]
        }
      },
      select: { email: true, name: true, role: true }
    })

    if (existingUsers.length > 0) {
      console.log("📋 Found existing users that will be UPDATED:")
      existingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name}, Role: ${user.role})`)
      })
      console.log("")
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10)
    const userPassword = await bcrypt.hash("user123", 10)

    // Create admin user
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@divinejesus.org" }
    })

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@divinejesus.org" },
      update: {
        password: adminPassword,
        name: "Admin User",
        role: "ADMIN",
      },
      create: {
        email: "admin@divinejesus.org",
        password: adminPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    })

    console.log(existingAdmin 
      ? `✅ Admin user UPDATED: ${adminUser.email}`
      : `✅ Admin user CREATED: ${adminUser.email}`)

    // Create regular user
    const regularUser = await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: {
        password: userPassword,
        name: "John Doe",
        role: "USER",
      },
      create: {
        email: "user@example.com",
        password: userPassword,
        name: "John Doe",
        role: "USER",
      },
    })

    console.log("✅ Regular user created/updated:", regularUser.email)

    // Create additional test users
    const testUsers = [
      { email: "mary@example.com", name: "Mary Johnson", role: "USER" as const },
      { email: "peter@example.com", name: "Peter Smith", role: "USER" as const },
      { email: "sarah@example.com", name: "Sarah Williams", role: "USER" as const },
    ]

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash("password123", 10)
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
      })
      console.log(`✅ Test user created/updated: ${user.email}`)
    }

    console.log("\n🎉 User seeding completed successfully!")
    console.log("\n📝 Login credentials:")
    console.log("Admin: admin@divinejesus.org / admin123")
    console.log("User: user@example.com / user123")
    console.log("Other test users: password123")
  } catch (error) {
    console.error("❌ Error seeding users:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
