import { ArrowUpRight, Award, BadgeCheck, PlayCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REFUND_MAX_PROGRESS_PERCENT, REFUND_WINDOW_DAYS } from "@/lib/refund/refund-policy";

const highlights = [
  { icon: PlayCircle, title: "เรียนได้ทุกที่ ทุกเวลา", description: "ดูวิดีโอซ้ำได้ไม่จำกัด พร้อมติดตามความคืบหน้า" },
  { icon: Award, title: "รับใบประกาศนียบัตร", description: "เมื่อเรียนครบ 100% ตรวจสอบรหัสได้ออนไลน์" },
  {
    icon: RotateCcw,
    title: `คืนเงินได้ภายใน ${REFUND_WINDOW_DAYS} วัน`,
    description: `ถ้าเรียนไม่เกิน ${REFUND_MAX_PROGRESS_PERCENT}% ของคอร์ส`,
  },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-20 sm:py-28">
      {/* แสงพื้นหลังแบบไล่สี ใช้ div ธรรมดาเพื่อให้ยังเป็น Server Component */}
      <div aria-hidden="true" className="-z-10 pointer-events-none absolute inset-0">
        <div className="-translate-x-1/2 absolute top-[-10rem] left-1/2 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-8rem] bottom-[-12rem] size-[28rem] rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <Badge asChild className="rounded-full border-border py-1" variant="secondary">
          <Link href="/courses/unit-testing-vitest">
            <BadgeCheck className="mr-1 size-4 text-primary" /> ใหม่! คอร์ส Unit Testing ด้วย Vitest
            <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Badge>

        <h1 className="mx-auto mt-6 max-w-2xl text-balance font-semibold text-4xl tracking-[-0.04em] sm:text-5xl md:text-6xl/[1.15]">
          เรียนเขียนโปรแกรม <span className="text-primary">จากโปรเจกต์จริง</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl/relaxed">
          คอร์สออนไลน์ด้าน Frontend, Backend และ Software Testing โดย CodingThailand
          เรียนตามจังหวะของคุณเอง พร้อมแบบฝึกหัดที่นำไปใช้งานได้ทันที
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="rounded-full" data-testid="hero-browse-courses" size="lg">
            <Link href="/courses">
              ดูคอร์สทั้งหมด <ArrowUpRight className="h-5! w-5!" />
            </Link>
          </Button>
          <Button asChild className="rounded-full shadow-none" size="lg" variant="outline">
            <Link href="/free-courses">
              <PlayCircle className="h-5! w-5!" /> ลองเรียนคอร์สฟรี
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <div className="rounded-xl border bg-card/60 p-5 text-center backdrop-blur-sm sm:text-start" key={title}>
            <Icon aria-hidden="true" className="mx-auto size-5 text-primary sm:mx-0" />
            <h2 className="mt-3 font-medium text-base tracking-[-0.015em]">{title}</h2>
            <p className="mt-1 text-muted-foreground text-sm">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
