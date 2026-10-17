import { GraduationCap } from "lucide-react";
import Link from "next/link";

export const Logo = () => (
  <Link className="flex items-center gap-2 font-semibold tracking-tight" data-testid="nav-logo" href="/">
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <GraduationCap className="size-5" />
    </span>
    <span className="hidden sm:inline">
      CodingThailand <span className="text-primary">Academy</span>
    </span>
  </Link>
);
