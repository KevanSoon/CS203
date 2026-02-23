import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/auth/logout`,
			{},
			{
				withCredentials: true,
				headers: {
					Cookie: req.headers.get("cookie") || "",
				},
			},
		);

		// Retrieve the cookie from Spring Boot to clear it
		const cookie = response.headers["set-cookie"];

		// No content response with the Set-Cookie header to clear the JWT
		const BFFResponse = new Response(null, {
			status: 204,
			headers: {
				"Set-Cookie": cookie?.[0] || "",
			},
		});

		return BFFResponse;
	} catch (err: any) {
		console.error("Logout error:", err);
		return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Logout failed. Please try again later" }, 
            { status: err?.response?.status || 500 });
	}
}
