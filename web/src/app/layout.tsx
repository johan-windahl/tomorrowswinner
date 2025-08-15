import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}>
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
          <nav className="container flex items-center justify-between py-4">
            <Link
              className="text-xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
              href="/"
            >
              Tomorrow&apos;s Winner
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                className="text-gray-300 hover:text-gray-100 font-medium transition-colors duration-200 relative group"
                href="/competitions"
              >
                Competitions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                className="text-gray-300 hover:text-gray-100 font-medium transition-colors duration-200 relative group"
                href="/leaderboard"
              >
                Leaderboards
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                className="text-gray-300 hover:text-gray-100 font-medium transition-colors duration-200 hidden sm:block"
                href="/profile"
              >
                Profile
              </Link>
              <Link
                className="btn btn-primary"
                href="/auth/sign-in"
              >
                Sign in
              </Link>
            </div>
          </nav>
        </header>

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
                  <li><Link href="/api/health" className="hover:text-gray-200 transition-colors">System Status</Link></li>
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
      </body>
    </html>
  );
}
