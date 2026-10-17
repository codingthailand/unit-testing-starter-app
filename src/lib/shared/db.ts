import { Prisma, type PrismaClient } from "@generated/prisma/client"

/**
 * client ที่ repository รับเข้ามา — ใช้ได้ทั้ง PrismaClient ปกติ
 * และ transaction client (tx) จาก prisma.$transaction
 */
export type DbClient = PrismaClient | Prisma.TransactionClient

/** error จาก unique constraint (P2002) — ใช้ใน repository เพื่อรับมือ request ที่มาพร้อมกัน */
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}
