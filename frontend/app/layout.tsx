import "./globals.css";
import Header from "@/components/general/Header";
import Footer from "@/components/general/Footer";

export default function RootLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}) {
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
