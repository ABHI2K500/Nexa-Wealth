import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexaWealth | Budget Dashboard",
  description: "Premium SaaS budget tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex bg-[#020617]`}>
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto w-full p-8 hidden-scrollbar relative z-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
