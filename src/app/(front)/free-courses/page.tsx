import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { CourseGridSkeleton } from "@/components/course/course-grid-skeleton";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { services } from "@/lib/container";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "คอร์สฟรี" };

const numberFormatter = new Intl.NumberFormat("th-TH");

async function FreeCourseList() {
  await connection(); // เรียก API ภายนอกตอน request
  const { courses, error } = await services.freeCourse.list();

  if (error) {
    return (
      <Alert data-testid="free-courses-error" variant="destructive">
        <AlertTitle>ไม่สามารถโหลดคอร์สฟรีได้ในขณะนี้</AlertTitle>
        <AlertDescription>กรุณาลองใหม่อีกครั้งภายหลัง ระหว่างนี้เลือกดูคอร์สอื่นของเราได้ที่หน้าคอร์สทั้งหมด</AlertDescription>
      </Alert>
    );
  }

  if (courses.length === 0) {
    return <p className="text-muted-foreground" data-testid="free-courses-empty">ยังไม่มีคอร์สฟรี</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="free-courses">
      {courses.map((course) => (
        <article className="overflow-hidden rounded-xl border bg-card" data-testid={`free-course-${course.id}`} key={course.id}>
          <div className="relative aspect-video bg-muted">
            <Image alt={course.title} className="object-cover" fill sizes="(min-width: 1024px) 25vw, 50vw" src={course.picture} />
          </div>
          <div className="space-y-2 p-4">
            <h2 className="font-semibold">{course.title}</h2>
            <p className="line-clamp-2 text-muted-foreground text-sm">{course.detail}</p>
            <p className="flex items-center gap-1 text-muted-foreground text-xs">
              <Eye className="size-3.5" /> {numberFormatter.format(course.view)} ครั้ง
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

// http://localhost:3000/free-courses
export default function FreeCoursesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader description="คอร์สฟรีจาก CodingThailand (ดึงข้อมูลจาก API ภายนอก)" title="คอร์สฟรี" />
      <div className="mt-8">
        <Suspense fallback={<CourseGridSkeleton count={8} />}>
          <FreeCourseList />
        </Suspense>
      </div>
    </main>
  );
}
