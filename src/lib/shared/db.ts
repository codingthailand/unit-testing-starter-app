import type { Prisma, PrismaClient } from "@generated/prisma/client"

/**
 * client ที่ repository รับเข้ามา — ใช้ได้ทั้ง PrismaClient ปกติ
 * และ transaction client (tx) จาก prisma.$transaction
 */
export type DbClient = PrismaClient | Prisma.TransactionClient
