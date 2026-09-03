import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_OK,
  authenticateCredentials,
} from "@/lib/credentials";

export const runtime = "nodejs";

const FAIL = { ok: false, error: "Invalid ID or password." };

export async function POST(req: Request) {
  let id = "";
  let password = "";
  try {
    const body = (await req.json()) as { id?: unknown; password?: unknown };
    id = typeof body.id === "string" ? body.id : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json(FAIL, { status: 401 });
  }

  if (!authenticateCredentials(id, password)) {
    return NextResponse.json(FAIL, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, AUTH_COOKIE_OK, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
