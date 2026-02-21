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
    
    const url = `${BACKEND_URL}/api/auth/register`;
    
    const response = await axios.post(url, body, { withCredentials: true });
    
    const cookie = response.headers["set-cookie"];

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { "Set-Cookie": cookie[0] } : {}),
      },
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.response?.error || "Internal Server Error", message: err?.response?.data?.message || "Registration failed. Please try again later" },
      { status: err?.response?.status || 500 }
    );
  }
}