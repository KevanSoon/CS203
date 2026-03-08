import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        await axios.post(`${BACKEND_URL}/api/progress/card/complete`, body, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return Response.json({ success: true });
    } catch (err: any) {
        console.error("Backend request failed:", err.message);
        return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Failed to mark card as complete." },
            { status: err?.response?.status || 500 }
        );
    }
}
