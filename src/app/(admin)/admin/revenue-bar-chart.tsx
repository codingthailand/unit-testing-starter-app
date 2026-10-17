"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTHB, satangToBaht } from "@/lib/shared/money";
import type { RevenueResponse } from "@/types/admin";

const shortDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

/** ส่วนที่ใช้ recharts (ไฟล์ใหญ่) — แยกไว้ให้ revenue-chart.tsx โหลดแบบ dynamic */
export default function RevenueBarChart({ points }: { points: RevenueResponse["points"] }) {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart data={points.map((point) => ({ ...point, baht: satangToBaht(point.totalSatang) }))}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="date"
          fontSize={12}
          minTickGap={16}
          tickFormatter={(value: string) => shortDate.format(new Date(`${value}T00:00:00Z`))}
          tickLine={false}
        />
        <YAxis axisLine={false} fontSize={12} tickFormatter={(value: number) => `฿${value.toLocaleString("th-TH")}`} tickLine={false} width={72} />
        <Tooltip
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
          cursor={{ fill: "var(--muted)" }}
          formatter={(value) => [formatTHB(Number(value) * 100), "รายได้"]}
          labelFormatter={(value) => shortDate.format(new Date(`${value}T00:00:00Z`))}
        />
        <Bar dataKey="baht" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
