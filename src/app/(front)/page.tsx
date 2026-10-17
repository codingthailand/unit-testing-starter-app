import { ArrowUpRight, Code2, Database, FlaskConical, Rocket, Smartphone } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CourseCard } from "@/components/course/course-card";
import { CourseGridSkeleton } from "@/components/course/course-grid-skeleton";
import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const FEATURED_COURSE_COUNT = 6;

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  frontend: Code2,
  backend: Database,
  testing: FlaskConical,
  mobile: Smartphone,
  devops: Rocket,
};

async function FeaturedCourses() {
  await connection(); // อ่านฐานข้อมูลจริง จึงเป็น dynamic
  const courses = await services.course.getFeaturedCourses(FEATURED_COURSE_COUNT);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="featured-courses">
      {courses.map((course, i) => (
        <CourseCard course={course} key={course.id} priority={i < 3} />
      ))}
    </div>
  );
}

async function CategoryList() {
  await connection();
  const categories = await services.course.listCategories();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.slug] ?? Code2;
        return (
          <Link
            className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition hover:border-primary hover:text-primary"
            data-testid={`category-${category.slug}`}
            href={`/courses?category=${category.slug}`}
            key={category.id}
          >
            <Icon className="size-7" />
            <span className="font-medium">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

// http://localhost:3000/
export default function Home() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-7xl px-6">
        <h2 className="font-semibold text-2xl tracking-tight">เลือกตามหมวดหมู่</h2>
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton className="h-32 rounded-xl" key={i} />
                ))}
              </div>
            }
          >
            <CategoryList />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-semibold text-2xl tracking-tight">คอร์สยอดนิยม</h2>
            <p className="mt-1 text-muted-foreground">คะแนนรีวิวสูงสุดจากผู้เรียนจริง</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/courses?sort=rating">
              ดูทั้งหมด <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <Suspense fallback={<CourseGridSkeleton count={FEATURED_COURSE_COUNT} />}>
            <FeaturedCourses />
          </Suspense>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-primary px-8 py-12 text-primary-foreground sm:px-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-balance font-semibold text-3xl tracking-tight">ใช้คูปอง WELCOME20 ลดทันที 20%</h2>
              <p className="mt-2 text-primary-foreground/80">สำหรับทุกคอร์ส ลดสูงสุด 500 บาท ใช้ได้ที่หน้าตะกร้า</p>
            </div>
            <Button asChild className="rounded-full" size="lg" variant="secondary">
              <Link href="/courses">เริ่มเลือกคอร์ส</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
