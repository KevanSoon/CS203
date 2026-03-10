import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    const { lessonId } = await params;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const { data } = await axios.get(`${BACKEND_URL}/api/progress/lesson/${lessonId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err.message);
        return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Failed to load lesson progress." },
            { status: err?.response?.status || 500 }
        );
    }
}
