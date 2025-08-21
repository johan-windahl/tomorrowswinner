import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import { Navigation } from "@/components/layout/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tomorrow's Winner | Stock & Crypto Prediction Competitions",
  description: "Compete in daily stock and crypto prediction contests. Pick tomorrow's best performer and climb the leaderboards!",
  keywords: "stock predictions, crypto predictions, trading competition, investment game",
  openGraph: {
    title: "Tomorrow's Winner",
    description: "Compete in daily stock and crypto prediction contests",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <GoogleAnalytics />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}>
        <Navigation />

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-950 text-gray-400 py-12 mt-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold gradient-text mb-4">Tomorrow&apos;s Winner</h3>
                <p className="text-gray-500 max-w-md">
                  The ultimate platform for stock and crypto prediction competitions.
                  Test your market intuition and compete with traders worldwide.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-200">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/competitions" className="hover:text-gray-200 transition-colors">Competitions</Link></li>
                  <li><Link href="/leaderboard" className="hover:text-gray-200 transition-colors">Leaderboards</Link></li>
                  <li><Link href="/profile" className="hover:text-gray-200 transition-colors">Profile</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-200">Support</h4>
                <ul className="space-y-2 text-sm">
                  {/* <li><Link href="/api/health" className="hover:text-gray-200 transition-colors">System Status</Link></li> */}
                  <li><span className="text-gray-600">System Status</span></li>
                  <li><span className="text-gray-600">Help Center</span></li>
                  <li><span className="text-gray-600">Contact</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
              <p>&copy; 2024 Tomorrow&apos;s Winner. Built for prediction enthusiasts.</p>
            </div>
          </div>
        </footer>

        {/* Cookie Consent Banner */}
        <CookieConsent />
      </body>
    </html>
  );
}
