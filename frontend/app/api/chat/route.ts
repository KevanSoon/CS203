import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const AI_BACKEND_URL = process.env.AI_BACKEND_URL;

export async function POST(req: NextRequest) {
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
        const { data } = await axios.post(`${AI_BACKEND_URL}/chat`, body);
        return Response.json(data);
    } catch (err: any) {
        console.error("AI chat request failed:", err.message);
        return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.detail || "Chat request failed. Please try again" },
            { status: err?.response?.status || 500 }
        );
    }
}
