import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import NoiseOverlay from "@/components/atmosphere/NoiseOverlay";
import PageTransition from "@/components/motion/PageTransition";
import ToastProvider from "@/components/toast/ToastProvider";
import ShortcutsProvider from "@/components/shortcuts/ShortcutsProvider";
import { getPostingStreak } from "@/lib/getPostingStreak";

export const metadata: Metadata = {
  title: "Tweetflow",
  description: "AI-powered X automation workspace",
  themeColor: "#010102",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const streak = await getPostingStreak();

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-screen bg-canvas font-sans text-ink antialiased">
        <NoiseOverlay />
        <ToastProvider>
          <ShortcutsProvider>
            <Sidebar streak={streak} />
            <main className="relative flex-1 overflow-hidden p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 900px 520px at 50% -8%, rgba(255,255,255,0.05), transparent 70%)",
                }}
              />
              <PageTransition>{children}</PageTransition>
            </main>
          </ShortcutsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
