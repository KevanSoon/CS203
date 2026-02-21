"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import toast, { Toaster as HotToaster, ToastBar } from "react-hot-toast";

const getCookie = (name: string) =>
    document.cookie
        .split("; ")
        .find((r) => r.startsWith(`${name}=`))
        ?.split("=")[1];

const clearCookie = (name: string) => {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export default function Toaster() {
	const pathname = usePathname();

    useEffect(() => {
        const flash = getCookie("flash_toast");
        if (!flash) return;

        if (flash === "unauthenticated" || flash === "unauthorized") {
            toast.error("You do not have the permissions to access this resource.");
        } else if (flash === "already_authenticated") {
            toast.error("Please logout before going back to the homepage");
        }

        clearCookie("flash_toast");
    }, [pathname]);
	return (
		<HotToaster
			position="bottom-right"
			gutter={8}
			toastOptions={{
				success: {
                    duration: 2000,
					style: {
						background: "rgb(60, 179, 113)",
						color: "white"
					},
				},
				error: {
                    duration: 2000,
					style: {
						background: "rgb(233, 47, 15)",
						color: "white"
					},
				},
			}}
		>
            {(t) => (
                <div
                    onClick={() => toast.dismiss(t.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toast.dismiss(t.id);
                    }}
                >
                    <ToastBar toast={t} style={{ ...t.style}} />
                </div>
            )}
        </HotToaster>
	);
}
