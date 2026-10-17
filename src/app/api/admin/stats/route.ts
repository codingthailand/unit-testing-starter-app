import { services } from "@/lib/container";
import type { StatsResponse } from "@/types/admin";
import { guardAdmin } from "../guard";

// GET /api/admin/stats
export async function GET() {
  const denied = await guardAdmin();
  if (denied) return denied;

  const body: StatsResponse = await services.admin.getStats();
  return Response.json(body);
}
