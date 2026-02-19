"use client";
import "./globals.css";
import Header from "@/components/general/Header";
import Footer from "@/components/general/Footer";
import Loader from "@/app/components/Spinner";
import { usePathname } from "next/navigation";
import { useSiteState } from "@/app/store/SiteStore";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const user = useSiteState((s) => s.user);

	// Hide header for dashboard, admin, and webadmin routes
	// const hideHeader = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/webadmin') || pathname?.startsWith('/profile');
	const showHeader = pathname?.endsWith("/") && user == null;

	// Hide header for dashboard, admin, and webadmin routes
	const hideFooter = false;

	return (
		<html lang="en">
			<body className="bg-background text-foreground">
				<Loader>
					{showHeader && <Header />}
					{children}
					{!hideFooter && <Footer />}
				</Loader>
			</body>
		</html>
	);
}
