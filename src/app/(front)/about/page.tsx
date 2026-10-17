import { Award, BookOpen, FlaskConical, GraduationCap, Layers, RotateCcw, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REFUND_MAX_PROGRESS_PERCENT, REFUND_WINDOW_DAYS } from "@/lib/refund/refund-policy";

export const metadata: Metadata = { title: "เกี่ยวกับเรา" };

const stats = [
  { icon: GraduationCap, value: "12+", label: "คอร์สออนไลน์" },
  { icon: BookOpen, value: "70+", label: "บทเรียนวิดีโอ" },
  { icon: Users, value: "1,200+", label: "ผู้เรียนสะสม" },
  { icon: Award, value: "100%", label: "มีใบประกาศเมื่อเรียนจบ" },
];

const features = [
  {
    icon: Layers,
    title: "โครงสร้างโค้ดที่ทดสอบได้",
    description: "แยกกฎทางธุรกิจเป็น pure function ใช้ repository pattern และ dependency injection ทั้งระบบ",
  },
  {
    icon: FlaskConical,
    title: "เหมาะกับการฝึกเขียนเทสต์",
    description: "มีกติกาคูปอง การคืนเงิน ความคืบหน้า และรายได้รายวัน ให้ออกแบบ test case ได้ครบทุกเทคนิค",
  },
  {
    icon: ShieldCheck,
    title: "ชำระเงินแบบจำลอง",
    description: "ใช้ payment gateway ปลอม ไม่มีการตัดเงินจริง ทดลอง flow สำเร็จ/ล้มเหลวได้ด้วยบัตรทดสอบ",
  },
  {
    icon: RotateCcw,
    title: "นโยบายคืนเงินชัดเจน",
    description: `ขอคืนเงินรายคอร์สได้ภายใน ${REFUND_WINDOW_DAYS} วัน เมื่อเรียนไปไม่เกิน ${REFUND_MAX_PROGRESS_PERCENT}%`,
  },
];

// http://localhost:3000/about
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl">เกี่ยวกับ CodingThailand Academy</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          แพลตฟอร์มคอร์สออนไลน์ที่สร้างขึ้นเพื่อใช้ประกอบการสอนวิชา Software Testing
          ทุกฟีเจอร์ถูกออกแบบให้เป็นโจทย์เขียน Unit, Integration และ E2E Test ได้จริง
        </p>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div className="rounded-xl border bg-card p-6 text-center" key={label}>
            <Icon className="mx-auto size-6 text-primary" />
            <p className="mt-3 font-semibold text-3xl">{value}</p>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <div className="rounded-xl border p-6" key={title}>
            <Icon className="size-6 text-primary" />
            <h2 className="mt-4 font-semibold text-lg">{title}</h2>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Button asChild size="lg">
          <Link href="/courses">ดูคอร์สทั้งหมด</Link>
        </Button>
      </div>
    </main>
  );
}
