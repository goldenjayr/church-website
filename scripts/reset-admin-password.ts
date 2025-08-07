import { prisma } from "../lib/prisma-client"
import * as bcrypt from "bcryptjs"

async function resetAdminPassword() {
  console.log("🔐 Resetting admin password...")

  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@divinejesus.org" },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            blogPosts: true,
            events: true,
          }
        }
      }
    })

    if (!adminUser) {
      console.error("❌ Admin user admin@divinejesus.org not found!")
      console.log("Run 'pnpm tsx scripts/seed-users.ts' to create it.")
      return
    }

    console.log("📋 Found admin user:")
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Blog Posts: ${adminUser._count.blogPosts}`)
    console.log(`   Events: ${adminUser._count.events}`)
    console.log("")

    // Hash the new password
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Update the password
    await prisma.user.update({
      where: { email: "admin@divinejesus.org" },
      data: { password: hashedPassword }
    })

    console.log("✅ Password successfully reset!")
    console.log("\n📝 New login credentials:")
    console.log("   Email: admin@divinejesus.org")
    console.log("   Password: admin123")
    console.log("\n⚠️  Please change this password after logging in for security!")

  } catch (error) {
    console.error("❌ Error resetting password:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
