"use client";

import { ArrowLeft, BookOpen, LayoutDashboard, Receipt, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard, testId: "admin-nav-dashboard" },
  { href: "/admin/courses", label: "คอร์ส", icon: BookOpen, testId: "admin-nav-courses" },
  { href: "/admin/coupons", label: "คูปอง", icon: Tag, testId: "admin-nav-coupons" },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: Receipt, testId: "admin-nav-orders" },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col gap-6 border-b bg-sidebar p-4 text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {LINKS.map(({ href, label, icon: Icon, testId }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"
              )}
              data-testid={testId}
              href={href}
              key={href}
            >
              <Icon className="size-4" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden space-y-2 text-sm md:block">
        <p className="text-muted-foreground">เข้าสู่ระบบในชื่อ</p>
        <p className="font-medium" data-testid="admin-name">{adminName}</p>
        <Link className="flex items-center gap-1 text-muted-foreground hover:text-foreground" href="/">
          <ArrowLeft className="size-4" /> กลับหน้าเว็บ
        </Link>
      </div>
    </aside>
  );
}
