import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const jwtCookie = request.cookies.get("jwt")?.value;

	let userType: string | null = null;

	// Parse the site-storage cookie

	if (jwtCookie) {
		try {
			const payload = jwtCookie.split(".")[1];
			const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
			userType = decoded.usertype || "user";
		} catch {
			userType = "user";
		}
	}

	const isLoggedIn = !!userType;

	const redirectMap: Record<string, string> = {
		root: "/webadmin",
		admin: "/admin",
		user: "/dashboard",
	};

	let url = "/";
	if (isLoggedIn) {
		url = redirectMap[userType!];
	}

	const publicRoutes = ["/", "/login", "/signup"];
	if (publicRoutes.includes(pathname)) {
		if (isLoggedIn) {
			return NextResponse.redirect(new URL(url, request.url));
		}
		return NextResponse.next();
	}

	// Not logged in - redirect to /
	if (!isLoggedIn) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Role-based redirects
	const userRoutes = ["/dashboard"];
	const adminRoutes = ["/admin"];
	const rootRoutes = ["/webadmin"];

	if (userRoutes.some((route) => pathname.startsWith(route))) {
		if (userType !== "user") {
			return NextResponse.redirect(new URL(url, request.url));
		}
	}

	if (adminRoutes.some((route) => pathname.startsWith(route))) {
		if (userType !== "admin") {
			return NextResponse.redirect(new URL(url, request.url));
		}
	}

	if (rootRoutes.some((route) => pathname.startsWith(route))) {
		if (userType !== "root") {
			return NextResponse.redirect(new URL(url, request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
