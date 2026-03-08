import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const AI_BACKEND_URL = process.env.AI_BACKEND_URL;

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const threadId = req.nextUrl.searchParams.get("thread_id");
        const userId = req.nextUrl.searchParams.get("user_id");

        if (!threadId) {
            return Response.json(
                { error: "Bad Request", message: "thread_id is required" },
                { status: 400 }
            );
        }

        const { data } = await axios.get(`${AI_BACKEND_URL}/chat/history`, {
            params: { thread_id: threadId, user_id: userId },
        });
        return Response.json(data);
    } catch (err: any) {
        console.error("AI history request failed:", err.message);
        return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.detail || "Failed to fetch chat history. Please try again" },
            { status: err?.response?.status || 500 }
        );
    }
}
