import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";
import { AdminPage } from "../../../components/admin-page";
import CourseForm from "../../../components/course-form";
import DeleteCourseButton from "../../../components/delete-course-button";
import LessonManager from "../../../components/lesson-manager";
import { updateCourseAction } from "../../actions";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "แก้ไขคอร์ส" };

type Params = Promise<{ id: string }>;

async function EditCourse({ params }: { params: Params }) {
  await connection();
  const { id } = await params;
  const courseId = Number(id);
  const [course, categories] = await Promise.all([
    Number.isInteger(courseId) ? services.courseAdmin.getCourse(courseId) : Promise.resolve(null),
    services.course.listCategories(),
  ]);
  if (!course) notFound();

  return (
    <AdminPage
      actions={
        <div className="flex gap-2">
          {course.isPublished && (
            <Button asChild variant="outline">
              <Link href={`/courses/${course.slug}`} target="_blank">
                <ExternalLink /> ดูหน้าคอร์ส
              </Link>
            </Button>
          )}
          <DeleteCourseButton courseId={course.id} title={course.title} />
        </div>
      }
      title={course.title}
    >
      <CourseForm action={updateCourseAction.bind(null, course.id)} categories={categories} course={course} submitLabel="บันทึก" />
      <LessonManager courseId={course.id} lessons={course.lessons} />
    </AdminPage>
  );
}

// http://localhost:3000/admin/courses/1
export default function EditCoursePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Skeleton className="m-10 h-96 rounded-xl" />}>
      <EditCourse params={params} />
    </Suspense>
  );
}
