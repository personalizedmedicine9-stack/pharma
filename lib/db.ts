import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// Resolve absolute database path from project root
const projectRoot = process.cwd()
const dbDir = path.join(projectRoot, 'db')
const dbPath = path.join(dbDir, 'custom.db')

// Ensure the db directory and file exist
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '')
  }
} catch {
  // Silently ignore — Prisma will throw its own error if DB is inaccessible
}

// Set DATABASE_URL in process.env BEFORE Prisma reads it
const absoluteDbUrl = `file:${dbPath}`
process.env.DATABASE_URL = absoluteDbUrl

// Also create .env file if missing so future builds work
try {
  const envPath = path.join(projectRoot, '.env')
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `DATABASE_URL=${absoluteDbUrl}\n`)
  }
} catch {
  // Ignore write failures
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: absoluteDbUrl,
      },
    },
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
