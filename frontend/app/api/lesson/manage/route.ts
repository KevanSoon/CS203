import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

/* ─── GET  — multiplexed: ?action=tags | ?action=check-title&title= | ?title= (edit) ─── */
export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    const action = request.nextUrl.searchParams.get("action");
    const headers = { Authorization: `Bearer ${jwt}` };

    try {
        /* ── Fetch all tags ── */
        if (action === "tags") {
            const { data } = await axios.get(`${BACKEND_URL}/api/lesson/tags`, { headers });
            return Response.json(data);
        }

        /* ── Check title availability ── */
        if (action === "check-title") {
            const title = request.nextUrl.searchParams.get("title");
            if (!title) {
                return Response.json(
                    { error: "Bad Request", message: "Lesson title is required" },
                    { status: 400 }
                );
            }
            const { data } = await axios.get(`${BACKEND_URL}/api/lesson/check-title`, {
                headers,
                params: { title },
            });
            return Response.json(data);
        }

        /* ── Default: fetch lesson for admin editing ── */
        const title = request.nextUrl.searchParams.get("title");
        if (!title) {
            return Response.json(
                { error: "Bad Request", message: "Lesson title is required" },
                { status: 400 }
            );
        }
        const { data } = await axios.get(`${BACKEND_URL}/api/lesson/admin/page`, {
            headers,
            params: { title },
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

/* ─── POST — create a new lesson ─── */
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const formData = await request.formData();
        const draft = request.nextUrl.searchParams.get("draft") === "true";

        const { data } = await axios.post(
            `${BACKEND_URL}/api/lesson/create${draft ? "?draft=true" : ""}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            },
        );

        return Response.json(data, { status: 201 });
    } catch (err: any) {
        console.error("Backend request failed:", err?.response?.data || err.message);
        return Response.json(
            {
                error: err?.response?.data?.error || "Internal Server Error",
                message: err?.response?.data?.message || "Lesson creation failed. Please try again later",
            },
            { status: err?.response?.status || 500 }
        );
    }
}

/* ─── PUT  — update an existing lesson ─── */
export async function PUT(request: NextRequest) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    const originalTitle = request.nextUrl.searchParams.get("originalTitle");
    if (!originalTitle) {
        return Response.json(
            { error: "Bad Request", message: "Original lesson title is required" },
            { status: 400 }
        );
    }

    try {
        const formData = await request.formData();
        const draft = request.nextUrl.searchParams.get("draft") === "true";

        const { data } = await axios.put(`${BACKEND_URL}/api/lesson/update`, formData, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            params: { originalTitle, ...(draft ? { draft: true } : {}) },
        });

        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err?.response?.data || err.message);
        return Response.json(
            {
                error: err?.response?.data?.error || "Internal Server Error",
                message: err?.response?.data?.message || "Lesson update failed. Please try again later",
            },
            { status: err?.response?.status || 500 }
        );
    }
}
