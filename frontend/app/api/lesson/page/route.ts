import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
    const title = request.nextUrl.searchParams.get("title");

    if (!title) {
        return Response.json({ error: "Missing title parameter" }, { status: 400 });
    }

    const token = (await cookies()).get("jwt")?.value;

    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { data } = await axios.get(`${BACKEND_URL}/api/lesson/page`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { title },
        });

        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err.message);
        const status = err.response?.status || 500;
        return Response.json({ error: "Failed to fetch lesson page from backend" }, { status });
    }
}