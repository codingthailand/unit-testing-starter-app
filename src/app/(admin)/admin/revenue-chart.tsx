"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_PERIOD, PERIODS, type Period } from "@/lib/admin/period";
import { formatTHB, satangToBaht } from "@/lib/shared/money";
import type { RevenueResponse } from "@/types/admin";

const PERIOD_LABELS: Record<Period, string> = { "7d": "7 วัน", "30d": "30 วัน", "90d": "90 วัน" };

const shortDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

/** กราฟรายได้รายวัน — ดึงจาก GET /api/admin/revenue */
export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/revenue?period=${period}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((body: RevenueResponse) => {
        if (!cancelled) {
          setData(body);
          setError(false);
        }
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <section className="rounded-xl border bg-card p-5" data-testid="revenue-chart">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">รายได้รายวัน</h2>
          <p className="text-muted-foreground text-sm">
            รวม <span data-testid="revenue-total">{data && data.period === period ? formatTHB(data.totalSatang) : "—"}</span>
          </p>
        </div>
        <Tabs onValueChange={(value) => setPeriod(value as Period)} value={period}>
          <TabsList>
            {PERIODS.map((item) => (
              <TabsTrigger data-testid={`revenue-period-${item}`} key={item} value={item}>
                {PERIOD_LABELS[item]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6 h-72">
        {error ? (
          <p className="text-destructive text-sm">โหลดข้อมูลรายได้ไม่สำเร็จ</p>
        ) : !data ? (
          <Skeleton className="size-full" />
        ) : (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data.points.map((point) => ({ ...point, baht: satangToBaht(point.totalSatang) }))}>
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
        )}
      </div>
    </section>
  );
}
