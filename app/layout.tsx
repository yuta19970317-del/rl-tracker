import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { AppProvider } from "@/contexts/AppContext";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RL Tracker",
  description: "Rocket League 2v2 戦績管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        {/* AppProvider is a Client Component — Supabase is only called in the browser */}
        <AppProvider>
          <Nav />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
