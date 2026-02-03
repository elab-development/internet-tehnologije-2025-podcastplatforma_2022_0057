import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Podcast platforma",
  description: "Kontaktirajte nas: podcastify@gmail.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className="min-h-screen flex flex-col bg-[#f4efe9] text-[#3f2d22]">
        <AuthProvider>
          
          <main className="flex-1">
            {children}
          </main>

        
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
