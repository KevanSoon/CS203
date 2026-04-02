import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(req: Request) {
  try {
    const jwt = (await cookies()).get("jwt")?.value;

    if (!jwt) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const response = await axios.post(
      `${BACKEND_URL}/api/quiz`,
      body,
      {
        headers: {
          Cookie: `jwt=${jwt}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        validateStatus: () => true,
      }
    );

    return Response.json(response.data, {
      status: response.status,
    });

  } catch (err) {
    console.error("BFF POST /api/quiz failed:", err);
    return Response.json({ error: "Failed to update Quiz Results. Try again later" }, { status: 500 });
  }
}