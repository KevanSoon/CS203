"use client";

import { useSiteState } from "@/app/store/SiteStore";

export default function Loader({ children }: { children: React.ReactNode }) {
	const { isLoading } = useSiteState();

	return (
		<>
			{isLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
					<div className="flex items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#9D94EB]" />
					</div>
				</div>
			)}
			{children}
		</>
	);
}
