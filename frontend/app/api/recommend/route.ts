import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const AI_BACKEND_URL = process.env.AI_BACKEND_URL;

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    try {
        const { data } = await axios.post(`${AI_BACKEND_URL}/recommend`, body, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return Response.json(data);
    } catch (err: any) {
        console.error("Recommend request failed:", err.message);
        return Response.json(
            { error: "Failed to fetch recommendations" },
            { status: err?.response?.status || 500 }
        );
    }
}
