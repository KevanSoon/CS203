import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      return Response.json({ valid: false }, { status: 200 });
    }

    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return Response.json({ valid: false }, { status: 200 });
    }

    const response = await axios.post(
      `${BACKEND_URL}/api/profile/verify-password`,
      { password },
      {
        headers: {
          Cookie: `jwt=${jwt}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    if (response.status === 200) {
      return Response.json({ valid: true }, { status: 200 });
    }

    if (response.status === 400) {
      return Response.json({ valid: false }, { status: 200 });
    }

    if (response.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json({ valid: false }, { status: 200 });

  } catch (err) {
    console.error("VERIFY PASSWORD ERROR:", err);
    return Response.json({ valid: false }, { status: 200 });
  }
}