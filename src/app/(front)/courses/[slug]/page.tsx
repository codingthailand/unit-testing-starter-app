import { CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CourseCover } from "@/components/course/course-cover";
import { LevelBadge } from "@/components/course/level-badge";
import { Price } from "@/components/course/price";
import { RatingStars } from "@/components/course/rating-stars";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import { REFUND_MAX_PROGRESS_PERCENT, REFUND_WINDOW_DAYS } from "@/lib/refund/refund-policy";
import { canReview } from "@/lib/review/review-rules";
import { formatDuration } from "@/lib/shared/duration";
import AddToCartButton from "./add-to-cart-button";
import ReviewForm from "./review-form";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Params = Promise<{ slug: string }>;

const dateFormatter = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

async function CourseDetail({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const user = await getSessionUser();
  const detail = await services.course.getCourseDetail(slug, user?.id ?? null);
  if (!detail) notFound();

  const { course, enrollmentStatus, progressPercent } = detail;
  const enrolled = enrollmentStatus === "ACTIVE";
  const [reviews, myReview] = await Promise.all([
    services.review.listReviews(course.id),
    user ? services.review.getMyReview(user.id, course.id) : Promise.resolve(null),
  ]);
  const firstLesson = course.lessons[0];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link className="font-medium text-primary hover:underline" href={`/courses?category=${course.category.slug}`}>
              {course.category.name}
            </Link>
            <LevelBadge level={course.level} />
          </div>
          <h1 className="mt-3 text-balance font-semibold text-3xl tracking-tight sm:text-4xl" data-testid="course-title">
            {course.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{course.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <RatingStars rating={course.averageRating} reviewCount={course.reviewCount} />
            <span className="flex items-center gap-1">
              <PlayCircle className="size-4" /> {course.lessonCount} บทเรียน
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {formatDuration(course.totalMinutes)}
            </span>
          </div>

          <section className="mt-10">
            <h2 className="font-semibold text-xl">เนื้อหาในคอร์ส</h2>
            <Accordion className="mt-4 rounded-xl border" collapsible defaultValue="lessons" type="single">
              <AccordionItem value="lessons">
                <AccordionTrigger className="px-5">
                  {course.lessonCount} บทเรียน · {formatDuration(course.totalMinutes)}
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <ol className="divide-y border-t" data-testid="curriculum">
                    {course.lessons.map((lesson) => {
                      const open = enrolled || lesson.isPreview;
                      return (
                        <li className="flex items-center justify-between gap-4 px-5 py-3" key={lesson.id}>
                          <span className="flex items-center gap-3">
                            {open ? (
                              <PlayCircle className="size-4 text-primary" />
                            ) : (
                              <Lock className="size-4 text-muted-foreground" />
                            )}
                            {open ? (
                              <Link
                                className="hover:text-primary hover:underline"
                                data-testid={`lesson-link-${lesson.id}`}
                                href={`/learn/${course.slug}/${lesson.id}`}
                              >
                                {lesson.position}. {lesson.title}
                              </Link>
                            ) : (
                              <span>
                                {lesson.position}. {lesson.title}
                              </span>
                            )}
                            {lesson.isPreview && !enrolled && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">ดูฟรี</span>
                            )}
                          </span>
                          <span className="shrink-0 text-muted-foreground text-sm">{lesson.durationMinutes} นาที</span>
                        </li>
                      );
                    })}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="mt-10">
            <h2 className="font-semibold text-xl">รายละเอียดคอร์ส</h2>
            <div className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">{course.description}</div>
          </section>

          <section className="mt-10 space-y-6" data-testid="reviews">
            <h2 className="font-semibold text-xl">รีวิวจากผู้เรียน ({reviews.length})</h2>
            {user && canReview(enrollmentStatus) && (
              <ReviewForm
                courseId={course.id}
                initial={myReview ? { rating: myReview.rating, comment: myReview.comment } : null}
                key={myReview?.updatedAt.toISOString() ?? "new"}
                slug={course.slug}
              />
            )}
            {!enrolled && <p className="text-muted-foreground text-sm">ลงทะเบียนคอร์สนี้ก่อนจึงจะรีวิวได้</p>}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">ยังไม่มีรีวิว</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li className="rounded-xl border p-5" data-testid={`review-${review.id}`} key={review.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{review.userName}</span>
                      <span className="text-muted-foreground text-xs">{dateFormatter.format(review.updatedAt)}</span>
                    </div>
                    <RatingStars className="mt-1" rating={review.rating} />
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <CourseCover imageName={course.imageName} priority title={course.title} />
            <div className="space-y-4 p-6">
              {enrolled ? (
                <>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>ความคืบหน้า</span>
                      <span data-testid="course-progress">{progressPercent}%</span>
                    </div>
                    <Progress className="mt-2" value={progressPercent} />
                  </div>
                  {firstLesson && (
                    <Button asChild className="w-full" data-testid="start-learning" size="lg">
                      <Link href={`/learn/${course.slug}/${firstLesson.id}`}>เข้าเรียน</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Price className="text-3xl" satang={course.priceSatang} />
                  <AddToCartButton
                    isLoggedIn={user !== null}
                    item={{
                      courseId: course.id,
                      slug: course.slug,
                      title: course.title,
                      priceSatang: course.priceSatang,
                      imageName: course.imageName,
                    }}
                  />
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" /> เรียนได้ตลอดชีพ
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" /> ใบประกาศนียบัตรเมื่อเรียนจบ
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      คืนเงินได้ภายใน {REFUND_WINDOW_DAYS} วัน (เรียนไม่เกิน {REFUND_MAX_PROGRESS_PERCENT}%)
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CourseDetailSkeleton() {
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="mt-10 h-80 w-full" />
      </div>
      <Skeleton className="h-[28rem] w-full rounded-xl" />
    </main>
  );
}

// http://localhost:3000/courses/react-fundamentals
export default function CourseDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetail params={params} />
    </Suspense>
  );
}
