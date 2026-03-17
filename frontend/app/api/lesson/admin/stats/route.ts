import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET() {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const { data } = await axios.get(`${BACKEND_URL}/api/lesson/admin/stats`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });

        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err?.response?.data || err.message);
        return Response.json(
            {
                error: err?.response?.data?.error || "Internal Server Error",
                message: err?.response?.data?.message || "Request failed. Please try again later",
            },
            { status: err?.response?.status || 500 }
        );
    }
}
