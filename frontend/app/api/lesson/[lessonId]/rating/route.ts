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
       const { data } = await axios.get(`${BACKEND_URL}/api/lesson/${lessonId}/rating`, {
           headers: { Authorization: `Bearer ${jwt}` },
       });


       return Response.json(data);
   } catch (err: any) {
       console.error("Backend request failed:", err.message);
       return Response.json(
           {
               error: err?.response?.error || "Internal Server Error",
               message: err?.response?.data?.message || "Failed to fetch rating. Please try again later",
           },
           { status: err?.response?.status || 500 }
       );
   }
}
