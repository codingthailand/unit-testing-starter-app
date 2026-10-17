import type { NextRequest } from "next/server";
import { services } from "@/lib/container";
import type { OrdersResponse } from "@/types/admin";
import { guardAdmin } from "../guard";

const DEFAULT_LIMIT = 5;

// GET /api/admin/orders?limit=5 (1–100)
export async function GET(request: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const orders = await services.admin.listOrders(limit);
  const body: OrdersResponse = {
    orders: orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString() })),
  };
  return Response.json(body);
}
