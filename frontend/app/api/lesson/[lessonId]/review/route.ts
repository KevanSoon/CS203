import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";


const BACKEND_URL = process.env.BACKEND_URL;


export async function POST(
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

   const body = await request.json();
   const { rating, feedback } = body;

   if (!rating || rating < 1 || rating > 5) {
       return Response.json(
           { error: "Invalid rating", message: "Rating must be between 1 and 5" },
           { status: 400 }
       );
   }

   try {
       const { data } = await axios.post(
           `${BACKEND_URL}/api/lesson/${lessonId}/review`,
           { rating, feedback },
           {
               headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", }
           }
       );


       return Response.json({ message: data });
   } catch (err: any) {
       console.error("Backend request failed:", err.message);
       return Response.json(
           {
               error: err?.response?.error || "Internal Server Error",
               message: err?.response?.data?.message || "Failed to submit review. Please try again later",
           },
           { status: err?.response?.status || 500 }
       );
   }
}

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

    const cookiesStore = await cookies();
    const jwt = cookiesStore.get("jwt")?.value;
    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
            { status: 401 }
        );
    }

    try {
        const { data } = await axios.get(`${BACKEND_URL}/api/lesson/${lessonId}/review`,
            { headers: { Authorization: `Bearer ${jwt}` } }
        );
        return Response.json({ review: data });
    } catch (err: any) {
        return Response.json(
            {
                error: err?.response?.data?.error || "Internal Server Error",
                message: "Failed to retrieve review"
            },
            { status: err?.response?.status || 500 }
        );
    }
}

