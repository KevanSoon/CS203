import axios from "axios";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      return Response.json(
        { error: "Internal Server Error", message: "Server not responding. Please try again later" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const response = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, body);

    return Response.json(response.data, { status: response.status });
  } catch (err: any) {
    return Response.json(
      { error: err?.response?.data?.error || "Internal Server Error", message: err?.response?.data?.message || "Request failed. Please try again later" },
      { status: err?.response?.status || 500 }
    );
  }
}