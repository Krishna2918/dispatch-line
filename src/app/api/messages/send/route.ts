import { NextResponse } from "next/server";
import { DEMO_DISPATCHER } from "@/lib/demo-data";
import { getDemoStore } from "@/lib/demo-store";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createUserSupabase } from "@/lib/supabase/client";
import { sendSms } from "@/lib/twilio";
import type { Message, Profile, SendMessageInput } from "@/lib/types";

export const runtime = "nodejs";

async function resolveSender(req: Request, fallback?: Profile): Promise<Profile> {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token && hasSupabaseConfig()) {
    const { data } = await createUserSupabase(token).auth.getUser();
    if (data.user) {
      const admin = createAdminSupabase();
      const profile = await admin
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile.data) {
        const fullName = profile.data.full_name as string;
        return {
          id: profile.data.id as string,
          name: fullName,
          fullName,
          role: profile.data.role as Profile["role"],
        };
      }
      const fullName = (data.user.user_metadata?.full_name as string) ?? "Dispatcher";
      return {
        id: data.user.id,
        name: fullName,
        fullName,
        role: "dispatcher",
      };
    }
  }
  return fallback ?? DEMO_DISPATCHER;
}

export async function POST(req: Request) {
  const input = (await req.json()) as SendMessageInput;
  const body = input.body?.trim() ?? "";
  if (!body) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }
  if (input.kind !== "sms_out" && input.kind !== "internal_note") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!input.conversationId || !input.driverId) {
    return NextResponse.json({ error: "conversationId and driverId are required" }, { status: 400 });
  }

  const sender = await resolveSender(req, input.sender);

  if (isDemoMode() || !hasSupabaseConfig()) {
    const message = getDemoStore().sendMessage({
      ...input,
      body,
      sender,
    });
    return NextResponse.json({ message, twilioSkipped: true });
  }

  const supabase = createAdminSupabase();
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id, phone")
    .eq("id", input.driverId)
    .single();
  if (driverError || !driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  }

  let twilioSid: string | null = null;
  let twilioSkipped = true;
  if (input.kind === "sms_out") {
    const sent = await sendSms(driver.phone as string, body);
    twilioSid = sent.sid;
    twilioSkipped = sent.skipped;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      driver_id: input.driverId,
      kind: input.kind,
      body,
      sender_profile_id: sender.id,
      sender_name: sender.fullName,
      twilio_sid: twilioSid,
    })
    .select(
      "id, conversation_id, driver_id, kind, body, sender_profile_id, sender_name, twilio_sid, broadcast_id, created_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  const message: Message = {
    id: data.id,
    conversationId: data.conversation_id,
    conversation_id: data.conversation_id,
    driverId: data.driver_id,
    kind: data.kind,
    body: data.body,
    senderProfileId: data.sender_profile_id,
    senderName: data.sender_name,
    sender_name: data.sender_name,
    twilioSid: data.twilio_sid,
    broadcastId: data.broadcast_id,
    broadcast_id: data.broadcast_id,
    createdAt: data.created_at,
    created_at: data.created_at,
  };

  return NextResponse.json({ message, twilioSkipped });
}
