import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number | null;
  reviewCount?: number;
  className?: string;
};

/** แสดงดาว 5 ดวงตามคะแนนเฉลี่ย (ปัดครึ่งดวงเป็นเต็มดวง) */
export function RatingStars({ rating, reviewCount, className }: RatingStarsProps) {
  if (rating === null) {
    return <span className={cn("text-muted-foreground text-sm", className)}>ยังไม่มีรีวิว</span>;
  }

  const filled = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)} data-testid="course-rating">
      <span className="font-semibold text-amber-600 dark:text-amber-400">{rating.toFixed(1)}</span>
      <span aria-hidden="true" className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            className={cn("size-3.5", i < filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
            key={i}
          />
        ))}
      </span>
      {reviewCount !== undefined && <span className="text-muted-foreground">({reviewCount})</span>}
    </span>
  );
}
