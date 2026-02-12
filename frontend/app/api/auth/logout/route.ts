import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
            withCredentials: true,
            headers: {
                Cookie: req.headers.get("cookie") || "",
            },
        });
        
        // Retrieve the cookie from Spring Boot to clear it
        const cookie = response.headers["set-cookie"];

        // Return no content response with the Set-Cookie header to clear the JWT
        return new Response(null, {
            status: 204,
            headers: {
                "Set-Cookie": cookie?.[0] || "",
            }
        });
    } catch (error) {
        console.error("Logout error:", error);
        return new Response(JSON.stringify({ error: "Logout failed" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            }
        });
    }
}
