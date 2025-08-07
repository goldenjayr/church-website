import { prisma } from "../lib/prisma-client"

async function checkUsers() {
  console.log("🔍 Checking existing users in database...\n")

  try {
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            blogPosts: true,
            events: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (allUsers.length === 0) {
      console.log("📭 No users found in the database.")
      console.log("\nYou can run 'pnpm tsx scripts/seed-users.ts' to create test users.")
    } else {
      console.log(`👥 Found ${allUsers.length} user(s):\n`)
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   Name: ${user.name || '(not set)'}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
        console.log(`   Blog Posts: ${user._count.blogPosts}`)
        console.log(`   Events: ${user._count.events}`)
        console.log("")
      })

      // Check for admin users
      const adminUsers = allUsers.filter(u => u.role === 'ADMIN')
      if (adminUsers.length === 0) {
        console.log("⚠️  No admin users found!")
        console.log("   You may want to create an admin user to access /admin pages.")
      } else {
        console.log(`✅ Found ${adminUsers.length} admin user(s)`)
      }
    }

    // Check if test users exist
    const testEmails = [
      "admin@divinejesus.org",
      "user@example.com",
      "mary@example.com",
      "peter@example.com",
      "sarah@example.com"
    ]

    const existingTestUsers = await prisma.user.findMany({
      where: {
        email: {
          in: testEmails
        }
      },
      select: { email: true }
    })

    const missingTestUsers = testEmails.filter(
      email => !existingTestUsers.some(u => u.email === email)
    )

    if (missingTestUsers.length > 0) {
      console.log("\n📝 Test users that would be CREATED if you run seed-users.ts:")
      missingTestUsers.forEach(email => {
        console.log(`   - ${email}`)
      })
    }

    if (existingTestUsers.length > 0) {
      console.log("\n⚠️  Test users that would be UPDATED if you run seed-users.ts:")
      existingTestUsers.forEach(user => {
        console.log(`   - ${user.email} (password will be reset)`)
      })
    }

  } catch (error) {
    console.error("❌ Error checking users:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
