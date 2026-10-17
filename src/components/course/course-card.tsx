import { Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { CourseCover } from "@/components/course/course-cover";
import { LevelBadge } from "@/components/course/level-badge";
import { Price } from "@/components/course/price";
import { RatingStars } from "@/components/course/rating-stars";
import type { CourseSummary } from "@/lib/course/course-types";
import { formatDuration } from "@/lib/shared/duration";

export function CourseCard({ course, priority }: { course: CourseSummary; priority?: boolean }) {
  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
      data-testid={`course-card-${course.slug}`}
      href={`/courses/${course.slug}`}
    >
      <CourseCover className="transition group-hover:opacity-95" imageName={course.imageName} priority={priority} title={course.title} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
          <span className="font-medium text-primary">{course.category.name}</span>
          <LevelBadge level={course.level} />
        </div>
        <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight group-hover:text-primary">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">{course.summary}</p>
        <RatingStars rating={course.averageRating} reviewCount={course.reviewCount} />
        <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
          <span className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <PlayCircle className="size-4" /> {course.lessonCount} บท
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {formatDuration(course.totalMinutes)}
            </span>
          </span>
          <Price className="text-base" satang={course.priceSatang} />
        </div>
      </div>
    </Link>
  );
}
