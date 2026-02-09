import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    const response = await axios.patch(`${BACKEND_URL}/api/profile`, body, {
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Cookie: `jwt=${jwt}` } : {}),
      },
    });

    return Response.json(response.data);
  } catch (err: any) {
    console.error(err);
    return Response.json(err.response?.data || { error: "Server error" }, {
      status: err.response?.status || 500,
    });
  }
}