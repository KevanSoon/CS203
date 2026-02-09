import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ Next 15/16 requires await
    const jwt = cookieStore.get("jwt")?.value;

    const response = await axios.get(`${BACKEND_URL}/api/profile`, {
      headers: {
        ...(jwt ? { Cookie: `jwt=${jwt}` } : {}),
      },
      timeout: 8000,
    });

    return Response.json(response.data);
  } catch (err: any) {
    console.error("GET /api/profile error:", err?.message, err?.response?.data);
    return Response.json(err?.response?.data || { error: err?.message || "Server error" }, {
      status: err?.response?.status || 500,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = await cookies(); // ✅ await
    const jwt = cookieStore.get("jwt")?.value;

    const response = await axios.patch(`${BACKEND_URL}/api/profile`, body, {
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Cookie: `jwt=${jwt}` } : {}),
      },
      timeout: 8000,
    });

    return Response.json(response.data);
  } catch (err: any) {
    console.error("PATCH /api/profile error:", err?.message, err?.response?.data);
    return Response.json(err?.response?.data || { error: err?.message || "Server error" }, {
      status: err?.response?.status || 500,
    });
  }
}