import type { PrismaClient } from "@generated/prisma/client"
import { createPrismaAdminRepository, type AdminRepository } from "@/lib/admin/admin-repository"
import { createPrismaOrderRepository, type OrderRepository } from "@/lib/checkout/order-repository"
import { createPrismaCouponRepository, type CouponRepository } from "@/lib/coupon/coupon-repository"
import { createPrismaCourseRepository, type CourseRepository } from "@/lib/course/course-repository"
import {
  createPrismaEnrollmentRepository,
  type EnrollmentRepository,
} from "@/lib/enrollment/enrollment-repository"
import {
  createPrismaCertificateRepository,
  type CertificateRepository,
} from "@/lib/learning/certificate-repository"
import {
  createPrismaProgressRepository,
  type ProgressRepository,
} from "@/lib/learning/progress-repository"
import { createPrismaReviewRepository, type ReviewRepository } from "@/lib/review/review-repository"
import type { DbClient } from "@/lib/shared/db"

/** repository ทุกตัวของระบบ — service รับเฉพาะตัวที่ต้องใช้ */
export type Repositories = {
  courses: CourseRepository
  coupons: CouponRepository
  orders: OrderRepository
  enrollments: EnrollmentRepository
  progress: ProgressRepository
  certificates: CertificateRepository
  reviews: ReviewRepository
  admin: AdminRepository
}

export function createPrismaRepositories(db: DbClient): Repositories {
  return {
    courses: createPrismaCourseRepository(db),
    coupons: createPrismaCouponRepository(db),
    orders: createPrismaOrderRepository(db),
    enrollments: createPrismaEnrollmentRepository(db),
    progress: createPrismaProgressRepository(db),
    certificates: createPrismaCertificateRepository(db),
    reviews: createPrismaReviewRepository(db),
    admin: createPrismaAdminRepository(db),
  }
}

/**
 * Unit of Work — รันหลายคำสั่งใน transaction เดียว
 * ตอนเทสต์ service ใช้ตัวปลอม: { run: (fn) => fn(fakeRepos) }
 */
export interface UnitOfWork {
  run<T>(fn: (repos: Repositories) => Promise<T>): Promise<T>
}

export function createPrismaUnitOfWork(prisma: PrismaClient): UnitOfWork {
  return {
    run(fn) {
      return prisma.$transaction((tx) => fn(createPrismaRepositories(tx)))
    },
  }
}
