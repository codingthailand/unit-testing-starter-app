import { Award, CheckCircle2, ChevronLeft, ChevronRight, Circle, Lock } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import { canAccessLesson } from "@/lib/enrollment/access-rules";
import { cn } from "@/lib/utils";
import CompleteButton from "./complete-button";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Params = Promise<{ slug: string; lessonId: string }>;

async function LessonView({ params }: { params: Params }) {
  await connection();
  const { slug, lessonId } = await params;
  const user = await getSessionUser();
  const result = await services.learning.getLessonPage({ slug, lessonId: Number(lessonId), userId: user?.id ?? null });

  if (!result.ok) {
    if (result.error.code === "LESSON_NOT_FOUND") notFound();
    if (result.error.code === "UNAUTHENTICATED") redirect(`/login?next=/learn/${slug}/${lessonId}`);
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Alert data-testid="lesson-locked">
          <Lock />
          <AlertTitle>{result.error.message}</AlertTitle>
          <AlertDescription>
            <Link className="underline" href={`/courses/${slug}`}>
              ไปที่หน้าคอร์สเพื่อลงทะเบียน
            </Link>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const { course, lesson, enrollmentStatus, completedLessonIds, progressPercent, certificateCode } = result.value;
  const done = new Set(completedLessonIds);
  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const enrolled = enrollmentStatus === "ACTIVE";

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <Link className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground" href={`/courses/${course.slug}`}>
          <ChevronLeft className="size-4" /> {course.title}
        </Link>
        <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
            data-testid="lesson-video"
            src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}`}
            title={lesson.title}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">
              บทที่ {lesson.position} · {lesson.durationMinutes} นาที
            </p>
            <h1 className="font-semibold text-2xl tracking-tight" data-testid="lesson-title">
              {lesson.title}
            </h1>
          </div>
          {enrolled ? (
            <CompleteButton
              completed={done.has(lesson.id)}
              lessonId={lesson.id}
              nextHref={next ? `/learn/${course.slug}/${next.id}` : null}
              slug={course.slug}
            />
          ) : (
            <Button asChild>
              <Link href={`/courses/${course.slug}`}>ซื้อคอร์สเพื่อเรียนต่อ</Link>
            </Button>
          )}
        </div>

        {certificateCode && (
          <Alert className="mt-6" data-testid="course-completed">
            <Award />
            <AlertTitle>ยินดีด้วย คุณเรียนจบคอร์สนี้แล้ว!</AlertTitle>
            <AlertDescription>
              <Link className="underline" data-testid="certificate-link" href={`/certificates/${certificateCode}`}>
                ดูใบประกาศนียบัตร ({certificateCode})
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex justify-between gap-4">
          {prev ? (
            <Button asChild variant="outline">
              <Link data-testid="lesson-prev" href={`/learn/${course.slug}/${prev.id}`}>
                <ChevronLeft /> บทก่อนหน้า
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button asChild variant="outline">
              <Link data-testid="lesson-next" href={`/learn/${course.slug}/${next.id}`}>
                บทถัดไป <ChevronRight />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-xl border bg-card lg:sticky lg:top-24">
        {enrolled && (
          <div className="border-b p-5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">ความคืบหน้า</span>
              <span data-testid="progress-percent">{progressPercent}%</span>
            </div>
            <Progress className="mt-2" value={progressPercent} />
          </div>
        )}
        <ol className="max-h-[60vh] divide-y overflow-y-auto">
          {course.lessons.map((item) => {
            const accessible = canAccessLesson({ isPreview: item.isPreview, enrollmentStatus });
            const Icon = done.has(item.id) ? CheckCircle2 : accessible ? Circle : Lock;
            const content = (
              <>
                <Icon className={cn("mt-0.5 size-4 shrink-0", done.has(item.id) ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1">
                  {item.position}. {item.title}
                </span>
                <span className="text-muted-foreground text-xs">{item.durationMinutes} น.</span>
              </>
            );
            return (
              <li key={item.id}>
                {accessible ? (
                  <Link
                    aria-current={item.id === lesson.id ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-3 px-5 py-3 text-sm hover:bg-muted/60",
                      item.id === lesson.id && "bg-primary/5 font-medium text-primary"
                    )}
                    data-testid={`sidebar-lesson-${item.id}`}
                    href={`/learn/${course.slug}/${item.id}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-5 py-3 text-muted-foreground text-sm">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </aside>
    </main>
  );
}

// http://localhost:3000/learn/react-fundamentals/1
export default function LessonPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_340px]">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </main>
      }
    >
      <LessonView params={params} />
    </Suspense>
  );
}
