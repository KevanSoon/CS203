import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json(
        { error: "Unauthorized" },
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

  } catch (err) {
    console.error("BFF GET /api/friendship failed:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
