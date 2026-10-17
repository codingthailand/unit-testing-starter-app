import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-muted-foreground text-sm">แอปตัวอย่างสำหรับคอร์ส Software Testing — ไม่มีการชำระเงินจริง</p>
        </div>
        <div className="flex gap-6 text-muted-foreground text-sm">
          <Link className="hover:text-foreground" href="/courses">คอร์สทั้งหมด</Link>
          <Link className="hover:text-foreground" href="/free-courses">คอร์สฟรี</Link>
          <Link className="hover:text-foreground" href="/about">เกี่ยวกับเรา</Link>
        </div>
      </div>
    </footer>
  );
}
