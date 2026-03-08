import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

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

    const { reportId, remark } = await req.json();

    const response = await axios.patch(
      `${BACKEND_URL}/api/report/admin/remarks`,
      null,
      {
        params: { reportId, remarks: remark },
        headers: {
          Cookie: `jwt=${jwt}`,
          Accept: "application/json",
        },
        validateStatus: () => true,
      }
    );

    return new Response(null, { status: response.status });
  } catch (err: any) {
    console.error("BFF PATCH /api/report/admin/remark failed:", err);
    return Response.json(
      {
        error: err?.response?.error || "Internal Server Error",
        message: err?.response?.data?.message || "Report remark update failed. Please try again later",
      },
      { status: err?.response?.status || 500 }
    );
  }
}
