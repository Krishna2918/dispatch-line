import { getDemoStaff } from "./auth";
import { DEMO_DISPATCHER, DEMO_STAFF, DEMO_STAFF_ROSTER } from "./demo-data";
import { getDemoStore } from "./demo-store";
import { hasSupabaseConfig, isDemoMode } from "./env";
import { createBrowserSupabase } from "./supabase/client";
import type {
  Broadcast,
  BroadcastInput,
  InboxClient,
  InboxSnapshot,
  Message,
  Profile,
  SendMessageInput,
} from "./types";

export { DEMO_STAFF, DEMO_STAFF_ROSTER };

function createDemoInboxClient(): InboxClient {
  const store = getDemoStore();
  return {
    async getSnapshot() {
      return store.snapshot(getDemoStaff());
    },
    async listMessages(conversationId) {
      return store.listMessages(conversationId);
    },
    async sendMessage(input) {
      return store.sendMessage(input);
    },
    async sendBroadcast(input) {
      return store.sendBroadcast(input);
    },
    async markRead(conversationId) {
      store.markRead(conversationId);
    },
    subscribe(cb) {
      return store.subscribe(cb);
    },
  };
}

type DriverRow = {
  id: string;
  full_name: string;
  phone: string;
  notes: string | null;
};
type TagRow = { id: string; name: string; color: string };
type DriverTagRow = { driver_id: string; tag_id: string };
type ConversationRow = {
  id: string;
  driver_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
};
type MessageRow = {
  id: string;
  conversation_id: string;
  driver_id: string;
  kind: Message["kind"];
  body: string;
  sender_profile_id: string | null;
  sender_name: string | null;
  twilio_sid: string | null;
  broadcast_id: string | null;
  created_at: string;
};
type ProfileRow = { id: string; full_name: string; role: Profile["role"] };

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    conversation_id: row.conversation_id,
    driverId: row.driver_id,
    kind: row.kind,
    body: row.body,
    senderProfileId: row.sender_profile_id,
    senderName: row.sender_name,
    sender_name: row.sender_name,
    twilioSid: row.twilio_sid,
    broadcastId: row.broadcast_id,
    broadcast_id: row.broadcast_id,
    createdAt: row.created_at,
    created_at: row.created_at,
  };
}

async function loadLiveSnapshot(staff: Profile): Promise<InboxSnapshot> {
  const supabase = createBrowserSupabase();
  const [driversRes, tagsRes, driverTagsRes, convRes, messagesRes] = await Promise.all([
    supabase.from("drivers").select("id, full_name, phone, notes"),
    supabase.from("tags").select("id, name, color"),
    supabase.from("driver_tags").select("driver_id, tag_id"),
    supabase
      .from("conversations")
      .select("id, driver_id, last_message_at, last_message_preview, unread_count")
      .order("last_message_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("messages")
      .select(
        "id, conversation_id, driver_id, kind, body, sender_profile_id, sender_name, twilio_sid, broadcast_id, created_at",
      )
      .order("created_at", { ascending: true }),
  ]);

  const error =
    driversRes.error ??
    tagsRes.error ??
    driverTagsRes.error ??
    convRes.error ??
    messagesRes.error;
  if (error) throw new Error(error.message);

  const driverTags = (driverTagsRes.data ?? []) as DriverTagRow[];
  const tagsByDriver = new Map<string, string[]>();
  for (const row of driverTags) {
    const list = tagsByDriver.get(row.driver_id) ?? [];
    list.push(row.tag_id);
    tagsByDriver.set(row.driver_id, list);
  }

  const conversations = ((convRes.data ?? []) as ConversationRow[]).map((row) => ({
    id: row.id,
    driverId: row.driver_id,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    unreadCount: row.unread_count,
  }));

  const convByDriver = new Map(conversations.map((c) => [c.driverId, c]));
  const tagList = (tagsRes.data ?? []) as TagRow[];
  const tagsById = new Map(tagList.map((tag) => [tag.id, tag]));
  const drivers = ((driversRes.data ?? []) as DriverRow[]).map((row) => {
    const conversation = convByDriver.get(row.id);
    const tagIds = tagsByDriver.get(row.id) ?? [];
    const lastAt = conversation?.lastMessageAt ?? null;
    const lastPreview = conversation?.lastMessagePreview ?? null;
    const unread = conversation?.unreadCount ?? 0;
    return {
      id: row.id,
      fullName: row.full_name,
      full_name: row.full_name,
      phone: row.phone,
      notes: row.notes ?? undefined,
      tags: tagIds.map((id) => tagsById.get(id)).filter((tag): tag is TagRow => Boolean(tag)),
      tagIds,
      lastMessageAt: lastAt,
      last_message_at: lastAt ?? "",
      lastMessagePreview: lastPreview,
      last_message_preview: lastPreview ?? "",
      unreadCount: unread,
      unread_count: unread,
    };
  });

  const messagesByConversation: InboxSnapshot["messagesByConversation"] = {};
  for (const row of (messagesRes.data ?? []) as MessageRow[]) {
    const mapped = mapMessage(row);
    const list = messagesByConversation[mapped.conversationId] ?? [];
    list.push(mapped);
    messagesByConversation[mapped.conversationId] = list;
  }

  return {
    staff,
    conversations,
    drivers,
    tags: (tagsRes.data ?? []) as TagRow[],
    messagesByConversation,
  };
}

function createLiveInboxClient(): InboxClient {
  const listeners = new Set<(snap: InboxSnapshot) => void>();

  async function currentStaff(): Promise<Profile> {
    const supabase = createBrowserSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return DEMO_DISPATCHER;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", auth.user.id)
      .maybeSingle();
    const row = data as ProfileRow | null;
    if (!row) {
      const fullName = auth.user.user_metadata?.full_name ?? "Dispatcher";
      return { id: auth.user.id, name: fullName, fullName, role: "dispatcher" };
    }
    return { id: row.id, name: row.full_name, fullName: row.full_name, role: row.role };
  }

  async function refresh() {
    const staff = await currentStaff();
    const snap = await loadLiveSnapshot(staff);
    for (const listener of listeners) listener(snap);
    return snap;
  }

  return {
    async getSnapshot() {
      return loadLiveSnapshot(await currentStaff());
    },
    async listMessages(conversationId) {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, conversation_id, driver_id, kind, body, sender_profile_id, sender_name, twilio_sid, broadcast_id, created_at",
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return ((data ?? []) as MessageRow[]).map(mapMessage);
    },
    async sendMessage(input: SendMessageInput) {
      const session = await createBrowserSupabase().auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as { message?: Message; error?: string };
      if (!res.ok || !json.message) throw new Error(json.error ?? "Send failed");
      await refresh();
      return json.message;
    },
    async sendBroadcast(input: BroadcastInput) {
      const session = await createBrowserSupabase().auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as { broadcast?: Broadcast; error?: string };
      if (!res.ok || !json.broadcast) throw new Error(json.error ?? "Broadcast failed");
      await refresh();
      return json.broadcast;
    },
    async markRead(conversationId) {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("conversations")
        .update({ unread_count: 0 })
        .eq("id", conversationId);
      if (error) throw new Error(error.message);
      await refresh();
    },
    subscribe(cb) {
      listeners.add(cb);
      if (!hasSupabaseConfig()) {
        return () => {
          listeners.delete(cb);
        };
      }
      const supabase = createBrowserSupabase();
      const channel = supabase
        .channel("dispatch-line-inbox")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => {
            void refresh();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "conversations" },
          () => {
            void refresh();
          },
        )
        .subscribe();
      return () => {
        listeners.delete(cb);
        void supabase.removeChannel(channel);
      };
    },
  };
}

export function getInboxClient(): InboxClient {
  if (isDemoMode()) return createDemoInboxClient();
  return createLiveInboxClient();
}
