import type { DbClient } from "@/lib/shared/db"
import { isOneOf, ORDER_ITEM_STATUSES, ORDER_STATUSES } from "@/lib/shared/status"
import type { RevenueItem } from "./revenue"
import type { DashboardCounts } from "./stats"
import type { AdminOrderRow } from "./admin-types"

export interface AdminRepository {
  listRevenueItems(since: Date): Promise<RevenueItem[]>
  getCounts(): Promise<DashboardCounts>
  listOrders(limit: number): Promise<AdminOrderRow[]>
}

export function createPrismaAdminRepository(db: DbClient): AdminRepository {
  return {
    async listRevenueItems(since) {
      const rows = await db.orderItem.findMany({
        where: { order: { status: "PAID", paidAt: { gte: since } } },
        select: { paidSatang: true, status: true, order: { select: { paidAt: true } } },
      })
      return rows.flatMap((row) =>
        row.order.paidAt && isOneOf(ORDER_ITEM_STATUSES, row.status)
          ? [{ paidAt: row.order.paidAt, paidSatang: row.paidSatang, status: row.status }]
          : []
      )
    },

    async getCounts() {
      const [revenue, refundedItems, paidOrders, students, publishedCourses] = await Promise.all([
        db.orderItem.aggregate({ where: { status: "PAID" }, _sum: { paidSatang: true }, _count: true }),
        db.orderItem.count({ where: { status: "REFUNDED" } }),
        db.order.count({ where: { status: "PAID" } }),
        db.enrollment.findMany({ where: { status: "ACTIVE" }, distinct: ["userId"], select: { userId: true } }),
        db.course.count({ where: { isPublished: true } }),
      ])
      return {
        revenueSatang: revenue._sum.paidSatang ?? 0,
        paidItems: revenue._count,
        refundedItems,
        paidOrders,
        activeStudents: students.length,
        publishedCourses,
      }
    },

    async listOrders(limit) {
      const rows = await db.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } },
      })
      return rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        customerName: row.user.name,
        customerEmail: row.user.email,
        status: isOneOf(ORDER_STATUSES, row.status) ? row.status : "PENDING",
        itemCount: row._count.items,
        totalSatang: row.totalSatang,
      }))
    },
  }
}
