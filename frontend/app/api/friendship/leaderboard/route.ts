import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

async function getJwt() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;
  if (!jwt) throw new Error("Unauthorized");
  return jwt;
}

export async function GET(req: NextRequest) {
  try {
    const jwt = await getJwt();

    const res = await axios.get(`${BACKEND_URL}/api/friendship/leaderboard`, {
      headers: { Authorization: `Bearer ${jwt}` },
      validateStatus: () => true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/friendship/leaderboard error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}