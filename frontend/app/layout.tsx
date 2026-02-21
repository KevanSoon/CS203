"use client";

import "./globals.css";
import Footer from "@/app/components/Footer";
import Loader from "@/app/components/Spinner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-background text-foreground">
				<Loader>
					{children}
					{<Footer />}
				</Loader>
			</body>
		</html>
	);
}
