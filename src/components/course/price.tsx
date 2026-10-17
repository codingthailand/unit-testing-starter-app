import { formatTHB } from "@/lib/shared/money";
import { cn } from "@/lib/utils";

export function Price({ satang, className }: { satang: number; className?: string }) {
  return (
    <span className={cn("font-semibold tabular-nums", className)}>
      {satang === 0 ? "ฟรี" : formatTHB(satang)}
    </span>
  );
}
