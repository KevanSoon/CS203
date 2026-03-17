import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function DELETE(request: Request, context: { params: Promise<{ lessonId: string }> }
) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    const { lessonId } = await context.params;

    //throw error
    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", "message":"Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const {data} = await axios.delete(`${BACKEND_URL}/api/lesson/${lessonId}`, {
            headers: {Authorization: `Bearer ${jwt}`},
        });

        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err.message);
        return Response.json(
            { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Lesson retrieval failed. Please try again" },
            { status: err?.response?.status || 500 }
        );
    }
}