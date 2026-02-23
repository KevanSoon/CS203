import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!; // http://localhost:8080

export async function GET(req: Request) {
  try {
    const jwt = (await cookies()).get("jwt")?.value;

    if (!jwt) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json({ error: "Username query param is required" }, { status: 400 });
    }

    const response = await axios.get(
      `${BACKEND_URL}/api/users/search`,
      {
        params: { username },
        headers: {
          Cookie: `jwt=${jwt}`,
          Accept: "application/json",
        },
        validateStatus: () => true,
      }
    );

    return Response.json(response.data, {
      status: response.status,
    });

  } catch (err) {
    console.error("BFF GET /api/users/search failed:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}