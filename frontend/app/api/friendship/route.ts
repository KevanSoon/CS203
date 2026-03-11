import { cookies } from "next/headers";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await axios.get(`${BACKEND_URL}/api/friendship`, {
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
      },
      validateStatus: () => true,
    });

    return new Response(JSON.stringify(res.data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("BFF GET /api/friendship failed:", err);

    return new Response(
      JSON.stringify({
        error: err.response?.data?.error || "Internal Server Error",
        message: "Failed to retrieve friend list",
      }),
      {
        status: err.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}