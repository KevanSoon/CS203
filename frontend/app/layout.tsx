import "./globals.css";
import type { Metadata } from "next";

import Footer from "@/app/components/Footer";
import Loader from "@/app/components/Spinner";
import Toaster from "@/app/components/Toaster";

export const metadata: Metadata = {
  title: "Simi Slang",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-background text-foreground">
				<Loader>
					{children}
					{<Footer />}
				</Loader>

				<Toaster />
			</body>
		</html>
	);
}
