import Image from "next/image";
import { cn } from "@/lib/utils";

/** รูปปกคอร์สจาก public/course-image (สัดส่วน 16:9) */
export function CourseCover({ imageName, title, className, priority }: {
  imageName: string;
  title: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-muted", className)}>
      <Image
        alt={`ปกคอร์ส ${title}`}
        className="object-cover"
        fill
        loading={priority ? "eager" : "lazy"}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        src={`/course-image/${imageName}`}
        unoptimized
      />
    </div>
  );
}
