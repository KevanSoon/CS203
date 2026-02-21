import { cookies } from "next/headers";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL!;

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    //throw error
    if (!jwt) {
        return Response.json(
            { error: "Unauthorized", "message":"Unauthorized access. Please refresh and try again" },
            { status: 401 }
    );
    }

    const response = await fetch(`${BACKEND_URL}/api/profile/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    });

    if(!response.ok){
      return Response.json(
      { error: response.statusText || "Internal Server Error", message: "Profile deletion failed. Please try again later" },
      { status: response.status }
    );
    }

    const BFFResponse = Response.json({ success: true });
    BFFResponse.headers.set(
      "Set-Cookie",
      "jwt=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    return BFFResponse
  } catch (err: any) {
    return Response.json(
      { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Profile deletion failed. Please try again later" },
      { status: err?.response?.status || 500 }
    );
  }
}
