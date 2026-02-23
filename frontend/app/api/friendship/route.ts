import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET() {
  try {
    const cookieStore = cookies();
    const jwt = (await cookieStore).get("jwt")?.value;

    if (!jwt) {
      return Response.json(
        { error: "Unauthorized", "message":"Unauthorized access. Please refresh and try again" },
        { status: 401 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/api/friendship`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    return Response.json(data, { status: res.status });

  } catch (err: any) {
    console.error("BFF GET /api/friendship failed:", err);
    return Response.json(
      { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Friend list retrieval failed. Please try again" },
      { status: err?.response?.status || 500 }
    );
  }
}
