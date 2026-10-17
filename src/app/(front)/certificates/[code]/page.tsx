import { Award } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";
import { formatDuration } from "@/lib/shared/duration";
import PrintButton from "./print-button";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "ใบประกาศนียบัตร" };

type Params = Promise<{ code: string }>;

const dateFormatter = new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeZone: "Asia/Bangkok" });

async function CertificateView({ params }: { params: Params }) {
  await connection();
  const { code } = await params;
  // params ถูก decode มาแล้วโดย Next.js — ห้าม decodeURIComponent ซ้ำ (รหัสที่มี % จะ throw)
  const certificate = await services.learning.getCertificate(code);
  if (!certificate) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 print:max-w-none print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <article
        className="relative overflow-hidden rounded-2xl border-8 border-primary/20 bg-white p-10 text-center text-slate-900 shadow-sm sm:p-16 print:min-h-screen print:rounded-none print:border-[16px] print:shadow-none"
        data-testid="certificate"
      >
        <div aria-hidden="true" className="-top-24 -right-24 absolute size-72 rounded-full bg-primary/10" />
        <div aria-hidden="true" className="-bottom-24 -left-24 absolute size-72 rounded-full bg-primary/10" />
        <Award className="mx-auto size-14 text-primary" />
        <p className="mt-4 font-medium text-primary text-sm uppercase tracking-[0.3em]">Certificate of Completion</p>
        <h1 className="mt-2 font-semibold text-3xl sm:text-4xl">ใบประกาศนียบัตร</h1>
        <p className="mt-8 text-slate-600">มอบให้ไว้เพื่อแสดงว่า</p>
        <p className="mt-2 font-semibold text-3xl text-slate-900 sm:text-4xl" data-testid="certificate-name">
          {certificate.userName}
        </p>
        <p className="mt-6 text-slate-600">ได้สำเร็จการศึกษาคอร์ส</p>
        <p className="mt-2 font-semibold text-2xl text-primary" data-testid="certificate-course">
          {certificate.courseTitle}
        </p>
        <p className="mt-2 text-slate-600 text-sm">ความยาวคอร์ส {formatDuration(certificate.totalMinutes)}</p>
        <div className="mx-auto mt-12 grid max-w-xl grid-cols-2 gap-8 text-sm">
          <div className="border-slate-300 border-t pt-2">
            <p className="font-medium">{dateFormatter.format(certificate.issuedAt)}</p>
            <p className="text-slate-500">วันที่ออกใบประกาศ</p>
          </div>
          <div className="border-slate-300 border-t pt-2">
            <p className="font-medium font-mono" data-testid="certificate-code">
              {certificate.code}
            </p>
            <p className="text-slate-500">รหัสตรวจสอบ</p>
          </div>
        </div>
        <p className="mt-10 font-semibold text-slate-700">CodingThailand Academy</p>
      </article>
    </main>
  );
}

// http://localhost:3000/certificates/CT-2026-ABC123
export default function CertificatePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-12 h-[32rem] max-w-5xl rounded-2xl" />}>
      <CertificateView params={params} />
    </Suspense>
  );
}
