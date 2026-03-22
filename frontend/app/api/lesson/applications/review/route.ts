import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL;

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, action } = body as { title?: string; action?: string }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'title' field." },
        { status: 400 },
      )
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid 'action'. Must be 'approve' or 'reject'." },
        { status: 400 },
      )
    }

    // Forward the auth cookie so Spring Security sees the ROOT session
    const cookie = req.headers.get("cookie") ?? ""

    const javaRes = await fetch(
      `${BACKEND_URL}/api/lesson/applications/review`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(cookie && { Cookie: cookie }),
        },
        body: JSON.stringify({ title: title.trim(), action }),
      },
    )

    const data = await javaRes.json().catch(() => null)

    if (!javaRes.ok) {
      const message =
        data?.message ?? `Backend responded with status ${javaRes.status}.`
      return NextResponse.json({ error: message }, { status: javaRes.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("[/api/lesson/applications/review] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}