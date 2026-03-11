import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;

  if (!jwt) {
    return Response.json(
      {
        error: "Unauthorized",
        message: "Unauthorized access. Please refresh and try again",
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return Response.json(
      {
        error: "Bad Request",
        message: "Lesson title must be provided",
      },
      { status: 400 },
    );
  }

  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/lesson/root/page`, {
      headers: { Authorization: `Bearer ${jwt}` },
      params: {
        title,
      },
    });

    return Response.json(data);
  } catch (err: any) {
    console.error("Backend request failed:", err.message);
    return Response.json(
      {
        error: err?.response?.error || "Internal Server Error",
        message:
          err?.response?.data?.message ||
          "Lesson preview retrieval failed. Please try again later",
      },
      { status: err?.response?.status || 500 },
    );
  }
}
