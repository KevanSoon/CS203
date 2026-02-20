import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!; // http://localhost:8080

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

    const response = await axios.get(
      `${BACKEND_URL}/api/profile`,
      {
        headers: {
          Cookie: `jwt=${jwt}`, // forward JWT cookie
          Accept: "application/json",
        },

        validateStatus: () => true,
      }
    );

    return Response.json(response.data, {
      status: response.status,
    });

  } catch (err) {
    console.error("BFF GET /api/profile failed:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}