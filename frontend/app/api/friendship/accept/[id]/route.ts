import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const resolvedParams = await params;
    
    const cookieStore = cookies();
    const jwt = (await cookieStore).get("jwt")?.value;
    
    const res = await fetch(
      `${BACKEND_URL}/api/friendship/accept/${resolvedParams.id}`,
      {
        method: "POST",
        headers: {
          Cookie: `jwt=${jwt}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json().catch(() => ({}));

    return Response.json(data, { status: res.status });
  } catch (err: any) {
    console.error("BFF POST /api/friendship/accept failed:", err);

    return Response.json(
      {
        error: "Internal Server Error",
        message: "Accept friend request failed",
      },
      { status: 500 }
    );
  }
}