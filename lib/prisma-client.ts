import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  })

// Optimize connection pool settings
prisma.$connect().catch((e) => {
  console.error('Failed to connect to database:', e)
  process.exit(1)
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Gracefully shutdown Prisma Client on app termination
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
