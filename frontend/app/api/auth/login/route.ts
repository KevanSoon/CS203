import axios from "axios";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
  if (!BACKEND_URL) {
    return Response.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      body,
      { withCredentials: true }
    );

    const cookies = response.headers["set-cookie"] ?? [];

    const headers = new Headers({
      "Content-Type": "application/json",
    });

    cookies.forEach((cookie: string) => {
      headers.append("Set-Cookie", cookie);
    });

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers,
    });

  } catch (err: any) {
  console.error("AXIOS ERROR STATUS:", err?.response?.status);
  console.error("AXIOS ERROR DATA:", err?.response?.data);
  console.error("AXIOS ERROR HEADERS:", err?.response?.headers);

  return Response.json(
    err?.response?.data || { error: "Authentication failed" },
    { status: err?.response?.status || 500 }
  );
}
}