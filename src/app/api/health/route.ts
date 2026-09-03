import { NextResponse } from "next/server";
import { hasSupabaseConfig, hasTwilioConfig, isDemoMode } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: isDemoMode() ? "demo" : "live",
    supabase: hasSupabaseConfig(),
    twilio: hasTwilioConfig(),
  });
}
