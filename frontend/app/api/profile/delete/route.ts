import { cookies } from "next/headers";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL!;

export async function DELETE(req: Request) {
  try {
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

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const response = await fetch(`${BACKEND_URL}/api/profile/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return Response.json(
        {
          error: errorData?.error || "Profile deletion failed",
          message:
            errorData?.message ||
            "Profile deletion failed. Please try again later",
        },
        { status: response.status }
      );
    }

    const BFFResponse = Response.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );

    BFFResponse.headers.set(
      "Set-Cookie",
      "jwt=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    return BFFResponse;
  } catch (err) {
    return Response.json(
      {
        error: "Internal Server Error",
        message: "Profile deletion failed. Please try again later",
      },
      { status: 500 }
    );
  }
}