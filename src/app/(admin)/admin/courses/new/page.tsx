import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";
import { AdminPage } from "../../../components/admin-page";
import CourseForm from "../../../components/course-form";
import { createCourseAction } from "../../actions";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "สร้างคอร์ส" };

async function NewCourseForm() {
  await connection();
  const categories = await services.course.listCategories();
  return <CourseForm action={createCourseAction} categories={categories} submitLabel="สร้างคอร์ส" />;
}

// http://localhost:3000/admin/courses/new
export default function NewCoursePage() {
  return (
    <AdminPage description="สร้างแล้วเพิ่มบทเรียนได้ในหน้าถัดไป" title="สร้างคอร์ส">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <NewCourseForm />
      </Suspense>
    </AdminPage>
  );
}
