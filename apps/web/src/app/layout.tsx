import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../components/ui/Toast";
import { Navigation } from "../components/Navigation";
import "./globals.css";
import DynamicGameBackground from "@/components/background/DynamicGameBackground";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "ConsciousFunnels - Первая sales platform с эмпатичным AI",
  description: "Создавайте воронки продаж с пониманием эмоций ваших клиентов. 100% бесплатно с AI анализом эмоций.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen overflow-hidden`}
        suppressHydrationWarning={true}
      >
        <DynamicGameBackground />
        <ToastProvider>
          <AuthProvider>
            <div className="relative z-10 flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1 pt-16">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
