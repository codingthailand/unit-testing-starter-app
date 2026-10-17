import type { Metadata } from "next";
import { Lora, Prompt, Roboto } from "next/font/google";
import { connection } from "next/server";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import AdminSidebar from "./components/admin-sidebar";
import "../globals.css";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" });

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const promptFont = Prompt({
  weight: ["400", "500", "700"],
  subsets: ["thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ระบบหลังบ้าน",
    template: "%s | ระบบหลังบ้าน CodingThailand Academy",
  },
};

/** ตรวจสิทธิ์ admin ก่อน render ทุกหน้าในกลุ่มนี้ (server action/API ตรวจซ้ำเองอีกชั้น) */
async function AdminShell({ children }: { children: React.ReactNode }) {
  await connection();
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar adminName={admin.name} />
      <div className="min-w-0 flex-1 bg-muted/30">{children}</div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(promptFont.className, "font-sans", roboto.variable, loraHeading.variable)}
      lang="th"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <AdminShell>{children}</AdminShell>
          </Suspense>
          <ToastContainer autoClose={3000} position="top-right" theme="colored" />
        </ThemeProvider>
      </body>
    </html>
  );
}
