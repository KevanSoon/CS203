import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
    const title = request.nextUrl.searchParams.get("title");

    if (!title) {
        return Response.json({ error: "Missing title parameter","message":"Oops! Something went wrong. Please try again later" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    //throw error
    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", "message":"Unauthorized access. Please refresh and try again" },
            { status: 401 }
    );
    }


    try {
        const { data } = await axios.get(`${BACKEND_URL}/api/lesson/page`, {
            headers: { Authorization: `Bearer ${jwt}` },
            params: { title },
        });

        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err.message);
        return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Lesson Content Retrieval failed. Please try again later" },
            { status: err?.response?.status || 500 }
        );
    }
}