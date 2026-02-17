"use client";
import "./globals.css";
import Header from "@/components/general/Header";
import Footer from "@/components/general/Footer";
import { usePathname } from "next/navigation";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide header for dashboard, admin, webadmin, profile, and lesson routes
  const hideHeader = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/webadmin') || pathname?.startsWith('/profile') || pathname?.startsWith('/lesson');

  // Hide header for dashboard, admin, and webadmin routes
  const hideFooter = false;


  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {!hideHeader && <Header />}
        {children}
        {!hideFooter && <Footer />}
      </body>
    </html>
  );
}
