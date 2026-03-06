import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const resovlvedParams = await params;
    const targetUserId = resovlvedParams.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await axios.post(
      `${BACKEND_URL}/api/friendship/${targetUserId}`,
      {},
      {
        headers: { Authorization: `Bearer ${jwt}` },
        validateStatus: () => true,
      }
    );

    return NextResponse.json(res.data, { status: res.status });

  } catch (err: any) {
    console.error("POST /api/friendship/[id] error:", err.message);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await axios.delete(
      `${BACKEND_URL}/api/friendship/${targetUserId}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
        validateStatus: () => true,
      }
    );

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(res.data, { status: res.status });

  } catch (err: any) {
    console.error("DELETE /api/friendship/[id] error:", err.message);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}