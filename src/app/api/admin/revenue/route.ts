import type { NextRequest } from "next/server";
import { parsePeriod } from "@/lib/admin/period";
import { services } from "@/lib/container";
import type { RevenueResponse } from "@/types/admin";
import { guardAdmin } from "../guard";

// GET /api/admin/revenue?period=7d|30d|90d (ค่าอื่น → 30d)
export async function GET(request: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const period = parsePeriod(request.nextUrl.searchParams.get("period"));
  const body: RevenueResponse = await services.admin.getRevenue(period);
  return Response.json(body);
}
