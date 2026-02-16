import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!; 

async function fetchWithJwt(url: string, method: "GET" | "DELETE") {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;

  if (!jwt) {
    return { status: 401, body: { error: "Unauthorized" }, cookieStore };
  }

  try {
    const res = await fetch(`${BACKEND_URL}${url}`, {
      method,
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
      },
      cache: method === "GET" ? "no-store" : undefined,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {}

    return { status: res.status, body: res.ok ? data : { error: data?.error || "Request failed" }, cookieStore };
  } catch (err) {
    console.error(`BFF ${method} ${url} failed:`, err);
    return { status: 500, body: { error: "Server error" }, cookieStore };
  }
}

export async function GET() {
  const { status, body } = await fetchWithJwt("/api/profile", "GET");
  return Response.json(body, { status });
}

export async function DELETE() {
  const { status, body, cookieStore } = await fetchWithJwt("/api/profile/delete", "DELETE");

  const headers = new Headers();
  headers.set("Set-Cookie", "jwt=; Path=/; HttpOnly; Max-Age=0");

  return Response.json(body, { status: status === 204 ? 200 : status, headers });
}
