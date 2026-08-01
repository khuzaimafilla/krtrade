import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import LanguageSelectorModal from "@/components/modals/LanguageSelectorModal";
import SplashScreen from "@/components/common/SplashScreen";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KRtrade by Filla Calon Wong Sugih 9 Naga",
  description: "Web-Based Trading Journal & Community PWA for 9 Naga Level Traders. Record trades, manage risk, & view multi-filter leaderboards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KRtrade",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#05C46B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-[#F8FAF9] text-[#1E2923] flex flex-col antialiased font-poppins">
        <LanguageProvider>
          <AuthProvider>
            <SplashScreen />
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 md:pb-8">
              {children}
            </main>
            <BottomNav />
            <LanguageSelectorModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
