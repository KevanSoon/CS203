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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const jwt = await getJwt();

    const res = await axios.post(
      `${BACKEND_URL}/api/friendship/pending/outgoing/${id}`,
      null, 
      {
        headers: { Authorization: `Bearer ${jwt}` },
        validateStatus: () => true,
      }
    );

    return NextResponse.json(res.data || {}, { status: res.status });
  } catch (err: any) {
    console.error("POST /api/friendship/pending/outgoing/[id] error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const jwt = await getJwt();

    const res = await axios.delete(
      `${BACKEND_URL}/api/friendship/pending/outgoing/${numericId}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
        validateStatus: () => true,
      }
    );

    if (res.status === 204) return new NextResponse(null, { status: 204 });

    return NextResponse.json(res.data || {}, { status: res.status });
  } catch (err: any) {
    console.error("DELETE /api/friendship/pending/outgoing/[id] error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}