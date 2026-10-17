"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_PERIOD, PERIODS, type Period } from "@/lib/admin/period";
import { formatTHB } from "@/lib/shared/money";
import type { RevenueResponse } from "@/types/admin";

const PERIOD_LABELS: Record<Period, string> = { "7d": "7 วัน", "30d": "30 วัน", "90d": "90 วัน" };

const chartSkeleton = <Skeleton className="size-full" />;

// recharts มีขนาดใหญ่ — แยก chunk ไม่ให้ถ่วง bundle แรกของหน้า
const loadBarChart = () => import("./revenue-bar-chart");
const RevenueBarChart = dynamic(loadBarChart, { ssr: false, loading: () => chartSkeleton });

/** กราฟรายได้รายวัน — ดึงจาก GET /api/admin/revenue */
export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadBarChart(); // โหลด chunk กราฟพร้อมกับดึงข้อมูล ไม่ต้องรอให้ข้อมูลมาก่อน
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
          chartSkeleton
        ) : (
          <RevenueBarChart points={data.points} />
        )}
      </div>
    </section>
  );
}
