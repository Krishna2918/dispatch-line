import { NextResponse } from "next/server";
import { DEMO_DISPATCHER } from "@/lib/demo-data";
import { getDemoStore } from "@/lib/demo-store";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createUserSupabase } from "@/lib/supabase/client";
import { sendSms } from "@/lib/twilio";
import type { Broadcast, BroadcastInput, Profile } from "@/lib/types";

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
    }
  }
  return fallback ?? DEMO_DISPATCHER;
}

export async function POST(req: Request) {
  const input = (await req.json()) as BroadcastInput;
  const body = input.body?.trim() ?? "";
  const tagIds = input.tagIds ?? [];
  const groupIds = input.groupIds ?? [];
  if (!body) {
    return NextResponse.json({ error: "Broadcast body is required" }, { status: 400 });
  }
  if (tagIds.length === 0 && groupIds.length === 0) {
    return NextResponse.json({ error: "Select at least one group" }, { status: 400 });
  }

  const sender = await resolveSender(req, input.sender);

  if (isDemoMode() || !hasSupabaseConfig()) {
    const broadcast = getDemoStore().sendBroadcast({ ...input, body, sender });
    return NextResponse.json({ broadcast, twilioSkipped: true });
  }

  const supabase = createAdminSupabase();
  const { data: tagged, error: tagError } = await supabase
    .from("driver_tags")
    .select("driver_id")
    .in("tag_id", tagIds);
  if (tagError) {
    return NextResponse.json({ error: tagError.message }, { status: 500 });
  }

  const driverIds = [...new Set((tagged ?? []).map((row) => row.driver_id as string))];
  if (driverIds.length === 0) {
    return NextResponse.json({ error: "No drivers match those tags" }, { status: 400 });
  }

  const { data: drivers, error: driverError } = await supabase
    .from("drivers")
    .select("id, phone")
    .in("id", driverIds);
  if (driverError) {
    return NextResponse.json({ error: driverError.message }, { status: 500 });
  }

  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("id, driver_id")
    .in("driver_id", driverIds);
  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  const convByDriver = new Map(
    (conversations ?? []).map((row) => [row.driver_id as string, row.id as string]),
  );

  for (const driver of drivers ?? []) {
    if (convByDriver.has(driver.id as string)) continue;
    const opened = await supabase
      .from("conversations")
      .insert({ driver_id: driver.id })
      .select("id, driver_id")
      .single();
    if (opened.data) {
      convByDriver.set(opened.data.driver_id as string, opened.data.id as string);
    }
  }

  const { data: broadcastRow, error: broadcastError } = await supabase
    .from("broadcasts")
    .insert({
      created_by: sender.id,
      body,
      tag_ids: tagIds,
      recipient_count: (drivers ?? []).length,
    })
    .select("id, created_by, body, tag_ids, recipient_count, created_at")
    .single();
  if (broadcastError || !broadcastRow) {
    return NextResponse.json({ error: broadcastError?.message ?? "Broadcast insert failed" }, { status: 500 });
  }

  let twilioSkipped = true;
  const rows = [];
  for (const driver of drivers ?? []) {
    const conversationId = convByDriver.get(driver.id as string);
    if (!conversationId) continue;
    const sent = await sendSms(driver.phone as string, body);
    if (!sent.skipped) twilioSkipped = false;
    rows.push({
      conversation_id: conversationId,
      driver_id: driver.id,
      kind: "sms_out",
      body,
      sender_profile_id: sender.id,
      sender_name: sender.fullName,
      twilio_sid: sent.sid,
      broadcast_id: broadcastRow.id,
    });
  }

  if (rows.length > 0) {
    const { error: msgError } = await supabase.from("messages").insert(rows);
    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }
  }

  const broadcast: Broadcast = {
    id: broadcastRow.id,
    createdBy: broadcastRow.created_by,
    createdByName: sender.fullName,
    body: broadcastRow.body,
    tagIds: broadcastRow.tag_ids,
    groupIds,
    recipientCount: broadcastRow.recipient_count,
    createdAt: broadcastRow.created_at,
  };

  return NextResponse.json({ broadcast, twilioSkipped });
}
