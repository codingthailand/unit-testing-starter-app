import { Award } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CourseCover } from "@/components/course/course-cover";
import { CourseGridSkeleton } from "@/components/course/course-grid-skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth/session";
import { services } from "@/lib/container";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "คอร์สของฉัน" };

async function MyCourseList() {
  await connection();
  const user = await requireUser("/my-courses");
  const courses = await services.learning.getMyCourses(user.id);

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center" data-testid="my-courses-empty">
        <p className="font-medium">ยังไม่ได้ลงทะเบียนคอร์สใด</p>
        <Button asChild className="mt-4">
          <Link href="/courses">เลือกคอร์สเรียน</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="my-courses">
      {courses.map(({ course, progressPercent, certificateCode, nextLessonId }) => (
        <article className="flex flex-col overflow-hidden rounded-xl border bg-card" data-testid={`my-course-${course.slug}`} key={course.id}>
          <CourseCover imageName={course.imageName} title={course.title} />
          <div className="flex flex-1 flex-col gap-4 p-5">
            <h2 className="font-semibold leading-snug">{course.title}</h2>
            <div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>ความคืบหน้า</span>
                <span data-testid={`my-course-progress-${course.slug}`}>{progressPercent}%</span>
              </div>
              <Progress className="mt-2" value={progressPercent} />
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              {nextLessonId && (
                <Button asChild size="sm">
                  <Link href={`/learn/${course.slug}/${nextLessonId}`}>{progressPercent === 0 ? "เริ่มเรียน" : "เรียนต่อ"}</Link>
                </Button>
              )}
              {certificateCode && (
                <Button asChild size="sm" variant="outline">
                  <Link data-testid={`certificate-link-${course.slug}`} href={`/certificates/${certificateCode}`}>
                    <Award /> ใบประกาศ
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// http://localhost:3000/my-courses
export default function MyCoursesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader description="เรียนต่อจากบทล่าสุด และดูใบประกาศของคอร์สที่เรียนจบ" title="คอร์สของฉัน" />
      <div className="mt-8">
        <Suspense fallback={<CourseGridSkeleton count={3} />}>
          <MyCourseList />
        </Suspense>
      </div>
    </main>
  );
}
