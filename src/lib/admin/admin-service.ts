import { DAY_MS, type Clock } from "@/lib/shared/clock"
import type { AdminRepository } from "./admin-repository"
import type { AdminOrderRow } from "./admin-types"
import { periodDays, type Period } from "./period"
import { groupRevenueByDay, sumRevenue, type RevenuePoint } from "./revenue"
import { buildDashboardStats, type DashboardStats } from "./stats"

export type AdminServiceDeps = {
  admin: AdminRepository
  clock: Clock
}

export function createAdminService({ admin, clock }: AdminServiceDeps) {
  return {
    async getStats(): Promise<DashboardStats> {
      return buildDashboardStats(await admin.getCounts())
    },

    async getRevenue(period: Period): Promise<{ period: Period; points: RevenuePoint[]; totalSatang: number }> {
      const now = clock()
      // ดึงเผื่อ 1 วันเพื่อครอบคลุมส่วนต่าง timezone แล้วให้ pure function ตัดขอบเอง
      const since = new Date(now.getTime() - (periodDays(period) + 1) * DAY_MS)
      const points = groupRevenueByDay(await admin.listRevenueItems(since), period, now)
      return { period, points, totalSatang: sumRevenue(points) }
    },

    async listOrders(limit: number): Promise<AdminOrderRow[]> {
      return admin.listOrders(Math.min(Math.max(1, Math.floor(limit) || 1), 100))
    },
  }
}

export type AdminService = ReturnType<typeof createAdminService>
