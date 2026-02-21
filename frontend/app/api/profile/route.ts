import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!; // http://localhost:8080

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await axios.get(
      `${BACKEND_URL}/api/profile`,
      {
        headers: {
          Cookie: `jwt=${jwt}`, // forward cookie to Spring Boot
          Accept: "application/json",
        },
        validateStatus: () => true,
      }
    );

    return Response.json(response.data, {
      status: response.status,
    });

  } catch (err) {
    console.error("BFF GET /api/profile failed:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ receive form data from frontend
    const formData = await req.formData();

    // ✅ forward to Spring Boot
    const response = await axios.patch(
      `${BACKEND_URL}/api/profile`,
      formData,
      {
        headers: {
          Cookie: `jwt=${jwt}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        validateStatus: () => true,
      }
    );

    return Response.json(response.data, {
      status: response.status,
    });

  } catch (err) {
    console.error("BFF PATCH /api/profile failed:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}