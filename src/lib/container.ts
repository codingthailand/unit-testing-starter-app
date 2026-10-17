import "server-only"
import { createAdminService } from "@/lib/admin/admin-service"
import { createCheckoutService } from "@/lib/checkout/checkout-service"
import { createOrderService } from "@/lib/checkout/order-service"
import { createCouponService } from "@/lib/coupon/coupon-service"
import { createCourseAdminService } from "@/lib/course/course-admin-service"
import { createCourseService } from "@/lib/course/course-service"
import { fetchFreeCourses } from "@/lib/free-course/free-course-client"
import { randomCodeGenerator } from "@/lib/learning/certificate-code"
import { createLearningService } from "@/lib/learning/learning-service"
import { createFakePaymentGateway } from "@/lib/payment/fake-payment-gateway"
import prisma from "@/lib/prisma"
import { createRefundService } from "@/lib/refund/refund-service"
import { createPrismaRepositories, createPrismaUnitOfWork } from "@/lib/repositories"
import { createReviewService } from "@/lib/review/review-service"
import { systemClock } from "@/lib/shared/clock"

/**
 * Composition root — ที่เดียวที่ประกอบ dependency จริงเข้าด้วยกัน
 * page / server action / route handler ใช้ service จากที่นี่ ห้ามสร้าง dependency เอง
 * (เทสต์ไม่ import ไฟล์นี้ แต่ประกอบ service เองด้วย fake หรือ Prisma ที่ชี้ไป test.db)
 */
const repos = createPrismaRepositories(prisma)
const uow = createPrismaUnitOfWork(prisma)
const clock = systemClock

const couponService = createCouponService(repos)
const paymentGateway = createFakePaymentGateway({ clock })

export const services = {
  course: createCourseService(repos),
  courseAdmin: createCourseAdminService(repos),
  coupon: couponService,
  checkout: createCheckoutService({
    ...repos,
    uow,
    couponService,
    paymentGateway,
    clock,
  }),
  order: createOrderService({ ...repos, clock }),
  refund: createRefundService({ ...repos, uow, paymentGateway, clock }),
  learning: createLearningService({ ...repos, clock, generateCode: randomCodeGenerator }),
  review: createReviewService(repos),
  admin: createAdminService({ ...repos, clock }),
  freeCourse: {
    list: () =>
      fetchFreeCourses({
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
        baseUrl: process.env.COURSE_API_URL || undefined,
      }),
  },
}
