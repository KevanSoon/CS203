import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      console.error("BACKEND_URL is not defined");
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const cookieStore = cookies();
    const jwt = (await cookieStore).get("jwt")?.value;

    if (!jwt) {
      return Response.json(
        {
          error: "Unauthorized",
          message: "Unauthorized access. Please refresh and try again",
        },
        { status: 401 }
      );
    }

    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return Response.json(
        {
          error: "Bad Request",
          message: "Password is required",
        },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${BACKEND_URL}/api/profile/verify-password`,
      { password }, 
      {
        headers: {
          Cookie: `jwt=${jwt}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        validateStatus: () => true, 
      }
    );

    return Response.json(response.data ?? null, {
      status: response.status,
    });

  } catch (err: any) {
    console.error("FULL ERROR:", err);
    console.error("ERR RESPONSE:", err?.response);
    console.error("ERR DATA:", err?.response?.data);

    return Response.json(
        { error: "Debug failure" },
        { status: 500 }
    );
    }
}