import axios from "axios";

export const runtime = "nodejs";
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
  try {
    console.log("==========================================");
    console.log("🟢 Next.js /api/auth/register route called");
    console.log("BACKEND_URL:", BACKEND_URL);
    console.log("==========================================");
    
    if (!BACKEND_URL) {
      console.error("❌ BACKEND_URL is not defined!");
      return Response.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log("📤 Request body:", body);
    
    const url = `${BACKEND_URL}/api/auth/register`;
    console.log("🎯 Calling Spring Boot at:", url);
    
    const response = await axios.post(url, body, { withCredentials: true });
    
    console.log("✅ Spring Boot responded with status:", response.status);
    console.log("Response data:", response.data);
    
    const cookie = response.headers["set-cookie"];

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { "Set-Cookie": cookie[0] } : {}),
      },
    });
  } catch (err: any) {
    console.error("==========================================");
    console.error("❌ Next.js route ERROR:");
    console.error("Error message:", err?.message);
    console.error("Response status:", err?.response?.status);
    console.error("Response data:", err?.response?.data);
    console.error("==========================================");
    
    return Response.json(
      { error: err?.response?.data?.message || err?.message || "Registration failed" },
      { status: err?.response?.status || 500 }
    );
  }
}