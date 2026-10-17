import { Badge } from "@/components/ui/badge";
import { COURSE_LEVEL_LABELS, type CourseLevel } from "@/lib/shared/status";

export function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <Badge className="rounded-full" variant="secondary">
      ระดับ{COURSE_LEVEL_LABELS[level]}
    </Badge>
  );
}
