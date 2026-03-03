import { NextRequest } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { params } = context;
    const resolvedParams = await params;

    console.log("Resolved params:", resolvedParams);

    const targetUserId = resolvedParams.id;
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400 }
      );
    }

    console.log("Target user ID:", targetUserId);

    const cookieStore = await cookies(); 
    const jwt = cookieStore.get("jwt")?.value;
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const res = await axios.post(
      `${BACKEND_URL}/api/friendship/${targetUserId}`,
      {},
      {
        headers: { Authorization: `Bearer ${jwt}`, },
        validateStatus: () => true,
      }
    );

    return new Response(JSON.stringify(res.data), { status: 200 });

  } catch (err: any) {
    console.error("❌ Error in /api/friendship/[id]:", err);

    if (err.response) {
      return new Response(
        JSON.stringify(err.response.data),
        { status: err.response.status }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: err.message || "Unexpected error"
      }),
      { status: 500 }
    );
  }
}
