import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContextLock",
  description: "Version Control for Your Resume",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#fdfaf6] text-slate-900 dark:bg-[#0a0508] dark:text-slate-50 antialiased relative min-h-screen overflow-x-hidden selection:bg-[#66023c] selection:text-white`}>
        {/* Elegant Aurora Background */}
        <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] h-[70vw] w-[70vw] rounded-full bg-[#66023c]/15 dark:bg-[#66023c]/25 blur-[160px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-[pulse_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[60vw] w-[60vw] rounded-full bg-[#d69cae]/20 dark:bg-[#400529]/30 blur-[140px] mix-blend-multiply dark:mix-blend-screen opacity-60 animate-[pulse_14s_ease-in-out_infinite_alternate]" />
          <div className="absolute top-[30%] left-[40%] h-[50vw] w-[50vw] rounded-full bg-[#e5cfac]/25 dark:bg-[#967232]/20 blur-[140px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-[pulse_12s_ease-in-out_infinite]" />
        </div>
        
        {children}
        
        {/* Google Analytics Global Tag */}
        <GoogleAnalytics gaId="G-VJDSP7V3XC" />
      </body>
    </html>
  );
}