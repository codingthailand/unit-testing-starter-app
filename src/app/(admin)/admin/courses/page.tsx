import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Price } from "@/components/course/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { services } from "@/lib/container";
import { COURSE_LEVEL_LABELS } from "@/lib/shared/status";
import { AdminPage } from "../../components/admin-page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "จัดการคอร์ส" };

async function CourseTable() {
  await connection();
  const courses = await services.courseAdmin.listCourses();

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table data-testid="admin-courses-table">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>คอร์ส</TableHead>
            <TableHead>หมวด</TableHead>
            <TableHead>ระดับ</TableHead>
            <TableHead className="text-right">บทเรียน</TableHead>
            <TableHead className="text-right">ราคา</TableHead>
            <TableHead>สถานะ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow data-testid={`admin-course-${course.slug}`} key={course.id}>
              <TableCell>{course.id}</TableCell>
              <TableCell>
                <Link className="font-medium hover:text-primary hover:underline" href={`/admin/courses/${course.id}`}>
                  {course.title}
                </Link>
              </TableCell>
              <TableCell>{course.category.name}</TableCell>
              <TableCell>{COURSE_LEVEL_LABELS[course.level]}</TableCell>
              <TableCell className="text-right">{course.lessonCount}</TableCell>
              <TableCell className="text-right">
                <Price satang={course.priceSatang} />
              </TableCell>
              <TableCell>
                {course.isPublished ? <Badge>เผยแพร่</Badge> : <Badge variant="secondary">ฉบับร่าง</Badge>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// http://localhost:3000/admin/courses
export default function AdminCoursesPage() {
  return (
    <AdminPage
      actions={
        <Button asChild data-testid="admin-course-new">
          <Link href="/admin/courses/new">
            <Plus /> สร้างคอร์ส
          </Link>
        </Button>
      }
      title="จัดการคอร์ส"
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <CourseTable />
      </Suspense>
    </AdminPage>
  );
}
