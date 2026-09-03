import { NextResponse } from "next/server";
import { getDemoStore } from "@/lib/demo-store";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { toE164 } from "@/lib/phone";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { emptyTwiml, formParams, verifyTwilioSignature } from "@/lib/twilio";

export const runtime = "nodejs";

function twiml() {
  return new NextResponse(emptyTwiml(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: Request) {
  const form = await req.formData();
  const params = formParams(form);

  if (!verifyTwilioSignature(req, params)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const fromRaw = params.From ?? params.from ?? "";
  const body = (params.Body ?? params.body ?? "").trim();
  const sid = params.MessageSid ?? params.SmsSid ?? null;

  if (!fromRaw) {
    return new NextResponse("Missing From", { status: 400 });
  }

  let from: string;
  try {
    from = toE164(fromRaw);
  } catch {
    return new NextResponse("Invalid From", { status: 400 });
  }

  if (isDemoMode() || !hasSupabaseConfig()) {
    getDemoStore().ingestInbound({ from, body, twilioSid: sid });
    return twiml();
  }

  const supabase = createAdminSupabase();

  if (sid) {
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("twilio_sid", sid)
      .maybeSingle();
    if (existing) return twiml();
  }

  let { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("phone", from)
    .maybeSingle();

  if (!driver) {
    const inserted = await supabase
      .from("drivers")
      .insert({ full_name: `Unknown ${from}`, phone: from })
      .select("id")
      .single();
    if (inserted.error || !inserted.data) {
      return new NextResponse("Failed to upsert driver", { status: 500 });
    }
    driver = inserted.data;
  }

  let { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("driver_id", driver.id)
    .maybeSingle();

  if (!conversation) {
    const inserted = await supabase
      .from("conversations")
      .insert({ driver_id: driver.id })
      .select("id")
      .single();
    if (inserted.error || !inserted.data) {
      return new NextResponse("Failed to open conversation", { status: 500 });
    }
    conversation = inserted.data;
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    driver_id: driver.id,
    kind: "sms_in",
    body: body || "(empty)",
    sender_profile_id: null,
    sender_name: null,
    twilio_sid: sid,
  });

  if (error) {
    return new NextResponse("Failed to store message", { status: 500 });
  }

  return twiml();
}
