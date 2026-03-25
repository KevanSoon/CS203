import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json(
        { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
        { status: 401 }
      );
    }

    // Decode usertype from JWT payload (server-side, safe)
    let usertype = "user";
    try {
      const payload = jwt.split(".")[1];
      const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
      usertype = decoded.usertype || "user";
    } catch {
      usertype = "user";
    }

    const response = await axios.get(`${BACKEND_URL}/api/profile`, {
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
      },
      validateStatus: () => true,
    });

    // Merge usertype into the response so the frontend can read it
    return Response.json(
      { ...response.data, usertype },
      { status: response.status }
    );
  } catch (err: any) {
    console.error("BFF GET /api/profile failed:", err);
    return Response.json(
      {
        error: err?.response?.error || "Internal Server Error",
        message: err?.response?.data?.message || "Profile retrieval failed. Please try again later",
      },
      { status: err?.response?.status || 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/profile
|--------------------------------------------------------------------------
| Update email/password/profile picture
|--------------------------------------------------------------------------
*/
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json(
        { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const response = await axios.patch(`${BACKEND_URL}/api/profile`, formData, {
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      validateStatus: () => true,
    });

    return Response.json(response.data, { status: response.status });
  } catch (err: any) {
    console.error("BFF PATCH /api/profile failed:", err);
    return Response.json(
      {
        error: err?.response?.error || "Internal Server Error",
        message: err?.response?.data?.message || "Profile update failed. Please try again later",
      },
      { status: err?.response?.status || 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json(
        { error: "Unauthorized", message: "Unauthorized access. Please refresh and try again" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return Response.json(
        { error: "Bad Request", message: "Password is required" },
        { status: 400 }
      );
    }

    const response = await axios.delete(`${BACKEND_URL}/api/profile`, {
      data: { password },
      headers: {
        Cookie: `jwt=${jwt}`,
        Accept: "application/json",
      },
      validateStatus: () => true,
    });

    if (response.status === 204 || response.status === 200) {
      return new Response(null, {
        status: 204,
        headers: {
          "Set-Cookie": `jwt=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        },
      });
    }

    return Response.json(response.data, { status: response.status });
  } catch (err: any) {
    console.error("BFF DELETE /api/profile failed:", err);
    return Response.json(
      {
        error: err?.response?.data?.error || "Internal Server Error",
        message: err?.response?.data?.message || "Account deletion failed. Please try again later",
      },
      { status: err?.response?.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json({ valid: false }, { status: 401 });
    }

    const { password } = await req.json();

    const response = await axios.post(
      `${BACKEND_URL}/api/profile`,
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

    if (response.status === 401) {
      return Response.json({ valid: false }, { status: 401 });
    }

    const isValid = response.data === true || response.data === "true";

    return Response.json({ valid: isValid }, { status: 200 });
  } catch (err: any) {
    console.error("Verify route error:", err?.response?.data || err.message);
    return Response.json({ valid: false }, { status: 500 });
  }
}