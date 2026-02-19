import { cookies } from "next/headers";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL!;

export async function DELETE() {
  try {
    const jwt = (await cookies()).get("jwt")?.value;

    if (!jwt) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/profile/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return Response.json(
        { error: "Delete failed", detail: text },
        { status: backendRes.status }
      );
    }

    const response = Response.json({ success: true });
    response.headers.set(
      "Set-Cookie",
      "jwt=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    return response;
  } catch (err: any) {
    return Response.json(
      { error: "BFF internal error", message: err?.message },
      { status: 500 }
    );
  }
}
