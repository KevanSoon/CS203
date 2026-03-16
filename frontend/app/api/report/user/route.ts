import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    if (!jwt) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Unauthorized access. Please refresh and try again",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/report/user`, body, {
      headers: {
        Cookie: `jwt=${jwt}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      validateStatus: () => true,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (err: any) {
    console.error("BFF POST /api/report/user failed:", err);
    return NextResponse.json(
      {
        error: err?.response?.data?.error || "Internal Server Error",
        message:
          err?.response?.data?.message ||
          "Report submission failed. Please try again later",
      },
      { status: err?.response?.status || 500 }
    );
  }
}