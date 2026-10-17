import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CourseCard } from "@/components/course/course-card";
import { CourseGridSkeleton } from "@/components/course/course-grid-skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services } from "@/lib/container";
import { parseCatalogParams, toCatalogQueryString, type CatalogParams } from "@/lib/course/catalog-params";
import { COURSE_LEVEL_LABELS, COURSE_LEVELS } from "@/lib/shared/status";
import { cn } from "@/lib/utils";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "คอร์สทั้งหมด" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SORT_LABELS: Record<CatalogParams["sort"], string> = {
  newest: "ใหม่ล่าสุด",
  "price-asc": "ราคาน้อย → มาก",
  "price-desc": "ราคามาก → น้อย",
  rating: "คะแนนรีวิว",
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

function FilterChip({ href, active, children, testId }: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <Link
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition",
        active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary"
      )}
      data-testid={testId}
      href={`/courses${href}`}
    >
      {children}
    </Link>
  );
}

async function Catalog({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = parseCatalogParams(await searchParams);
  const { courses, categories } = await services.course.getCourseList(params);

  return (
    <>
      <form action="/courses" className="flex flex-col gap-3 sm:flex-row" data-testid="catalog-form" method="get">
        {params.category && <input name="category" type="hidden" value={params.category} />}
        {params.level && <input name="level" type="hidden" value={params.level} />}
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="ค้นหาคอร์ส"
            className="pl-9"
            data-testid="catalog-search"
            defaultValue={params.q}
            name="q"
            placeholder="ค้นหาชื่อคอร์ส เช่น React, Testing"
          />
        </div>
        <select aria-label="เรียงลำดับ" className={selectClass} data-testid="catalog-sort" defaultValue={params.sort} name="sort">
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button data-testid="catalog-submit" type="submit">
          ค้นหา
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-muted-foreground text-sm">หมวด</span>
          <FilterChip active={!params.category} href={toCatalogQueryString({ ...params, category: undefined })} testId="filter-category-all">
            ทั้งหมด
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              active={params.category === category.slug}
              href={toCatalogQueryString({ ...params, category: category.slug })}
              key={category.id}
              testId={`filter-category-${category.slug}`}
            >
              {category.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-muted-foreground text-sm">ระดับ</span>
          <FilterChip active={!params.level} href={toCatalogQueryString({ ...params, level: undefined })} testId="filter-level-all">
            ทั้งหมด
          </FilterChip>
          {COURSE_LEVELS.map((level) => (
            <FilterChip
              active={params.level === level}
              href={toCatalogQueryString({ ...params, level })}
              key={level}
              testId={`filter-level-${level}`}
            >
              {COURSE_LEVEL_LABELS[level]}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="mt-8 text-muted-foreground text-sm" data-testid="catalog-count">
        พบ {courses.length} คอร์ส
      </p>

      {courses.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-12 text-center" data-testid="catalog-empty">
          <p className="font-medium">ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/courses">ล้างตัวกรอง</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard course={course} key={course.id} priority={i < 3} />
          ))}
        </div>
      )}
    </>
  );
}

// http://localhost:3000/courses?q=react&category=frontend&level=BEGINNER&sort=price-asc
export default function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader description="เลือกคอร์สที่ใช่ แล้วเริ่มเรียนได้ทันที" title="คอร์สทั้งหมด" />
      <div className="mt-8">
        <Suspense fallback={<CourseGridSkeleton />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
