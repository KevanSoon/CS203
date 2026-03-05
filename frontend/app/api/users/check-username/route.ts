import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") ?? "";

  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;

  if (!jwt) {
    return Response.json({ available: false }, { status: 401 });
  }

  const response = await fetch(
    `${BACKEND_URL}/api/users/check-username?username=${encodeURIComponent(username)}`,
    {
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json().catch(() => ({ available: false }));
  return Response.json(data, { status: response.status });
}