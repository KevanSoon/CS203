import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    //throw error
    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", "message":"Unauthorized access. Please refresh and try again" },
            { status: 401 }
    );
    }

    const response = await axios.get(
      `${BACKEND_URL}/api/report/root`,
      {
        headers: {
          Cookie: `jwt=${jwt}`, // forward cookie to Spring Boot
          Accept: "application/json",
        },
        validateStatus: () => true,
      }
    );

    return Response.json(response.data, {
      status: response.status,
    });

  } catch (err: any) {
    console.error("BFF GET /api/report/root failed:", err);
    return Response.json(
      { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Report retrieval failed. Please try again later" },
      { status: err?.response?.status || 500 }
    );
  }
}