import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ lessonId: string }> }
) {
    const { lessonId } = await context.params;

    if (!lessonId || lessonId === "undefined") {
        return Response.json(
            { error: "Missing lessonId", message: "Lesson ID is required" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;
    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const { data } = await axios.get(
            `${BACKEND_URL}/api/lesson/${lessonId}/reviews`,
            { headers: { Authorization: `Bearer ${jwt}` } }
        );

        // Spring Boot returns: [{ id, reviewedBy, username, avatarUrl, rating, feedback, createdAt }]
        const reviews = data.map((r: any) => ({
            id: r.id,
            username: r.username ?? "Unknown User",
            profilePictureUrl: r.avatarUrl ?? null,
            rating: r.rating,
            feedback: r.feedback ?? "",
            createdAt: r.createdAt,
        }));

        return Response.json({ reviews });
    } catch (err: any) {
        return Response.json(
            {
                error: err?.response?.data?.error || "Internal Server Error",
                message: err?.response?.data?.message || "Failed to retrieve reviews",
            },
            { status: err?.response?.status || 500 }
        );
    }
}