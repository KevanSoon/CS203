import { cookies } from "next/headers";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL!; 

export async function GET() {
  try {
    const jwt = (await cookies()).get("jwt")?.value;

    if (!jwt) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("BFF GET /api/profile failed:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
