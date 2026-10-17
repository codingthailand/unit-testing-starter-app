import type { Metadata } from "next";
import { Prompt, Roboto, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
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
  title: "เข้าสู่ระบบ | CodingThailand Academy",
  description: "เข้าสู่ระบบหรือสมัครสมาชิก CodingThailand Academy",
};

export default function AuthLayout({
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
      <body>
        <ThemeProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </ThemeProvider>
      </body>
    </html>
  );
}
