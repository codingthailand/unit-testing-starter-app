import { Suspense } from "react";
import type { Metadata } from "next";
import { Prompt, Roboto, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const loraHeading = Lora({subsets:['latin'],variable:'--font-heading'});

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

export const promptFont = Prompt({
  weight: ['400', '500', '700'],
  subsets: ['thai'],
  display: 'swap'
});


export const metadata: Metadata = {
  title: {
    default: "CodingThailand Academy — คอร์สออนไลน์",
    template: "%s | CodingThailand Academy",
  },
  description: "แพลตฟอร์มเรียนคอร์สออนไลน์ด้านการพัฒนาซอฟต์แวร์และ Software Testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={cn(promptFont.className, "font-sans", roboto.variable, loraHeading.variable)}
    >
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <Suspense fallback={<div className="h-16 border-b bg-background" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1">{children}</div>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </ThemeProvider>
      </body>
    </html>
  );
}
