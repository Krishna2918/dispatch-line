import { getDemoStaff } from "./auth";
import { DEMO_DISPATCHER, DEMO_STAFF, DEMO_STAFF_ROSTER } from "./demo-data";
import { getDemoStore } from "./demo-store";
import { hasSupabaseConfig, isDemoMode } from "./env";
import { createBrowserSupabase } from "./supabase/client";
import type {
  ActivityEvent,
  Broadcast,
  BroadcastInput,
  ContactGroup,
  ContactPatch,
  Conversation,
  InboxClient,
  InboxSnapshot,
  Message,
  PresenceMode,
  Profile,
  SendMessageInput,
  Tag,
  WorkflowStatus,
} from "./types";
import { asProfile, normalizeRole } from "./types";

export { DEMO_STAFF, DEMO_STAFF_ROSTER };

function emptyPresence(): InboxSnapshot["presence"] {
  return [];
}

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
    async assignConversation(conversationId, staffId, actor) {
      store.assignConversation(conversationId, staffId, actor);
    },
    async setWorkflowStatus(conversationId, status, actor) {
      store.setWorkflowStatus(conversationId, status, actor);
    },
    async updateContact(driverId, patch, actor) {
      store.updateContact(driverId, patch, actor);
    },
    async setContactGroups(driverId, groupIds, actor) {
      store.setContactGroups(driverId, groupIds, actor);
    },
    async createGroup(name, color, actor) {
      return store.createGroup(name, color, actor);
    },
    async updateGroup(groupId, patch, actor) {
      store.updateGroup(groupId, patch, actor);
    },
    async simulateInbound(conversationId, body) {
      return store.simulateInbound(conversationId, body);
    },
    publishPresence(entry) {
      store.publishPresence(entry);
    },
    resetDemo() {
      store.resetDemo();
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
  driver_code?: string | null;
  truck?: string | null;
  terminal?: string | null;
};
type TagRow = { id: string; name: string; color: string };
type DriverTagRow = { driver_id: string; tag_id: string };
type GroupRow = { id: string; name: string; color: string };
type DriverGroupRow = { driver_id: string; group_id: string };
type ConversationRow = {
  id: string;
  driver_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  read_at?: string | null;
  assigned_staff_id?: string | null;
  status?: WorkflowStatus | null;
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
type ProfileRow = { id: string; full_name: string; role: string };
type ActivityRow = {
  id: string;
  conversation_id: string | null;
  driver_id: string | null;
  staff_id: string;
  staff_name: string;
  kind: ActivityEvent["kind"];
  detail: string;
  created_at: string;
};

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

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    driverId: row.driver_id,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    unreadCount: row.unread_count,
    readAt: row.read_at ?? null,
    assignedStaffId: row.assigned_staff_id ?? null,
    status: row.status ?? "open",
  };
}

async function loadLiveSnapshot(staff: Profile): Promise<InboxSnapshot> {
  const supabase = createBrowserSupabase();
  const [
    driversRes,
    tagsRes,
    driverTagsRes,
    groupsRes,
    driverGroupsRes,
    convRes,
    messagesRes,
    profilesRes,
    activityRes,
  ] = await Promise.all([
    supabase.from("drivers").select("id, full_name, phone, notes, driver_code, truck, terminal"),
    supabase.from("tags").select("id, name, color"),
    supabase.from("driver_tags").select("driver_id, tag_id"),
    supabase.from("contact_groups").select("id, name, color"),
    supabase.from("driver_groups").select("driver_id, group_id"),
    supabase
      .from("conversations")
      .select(
        "id, driver_id, last_message_at, last_message_preview, unread_count, read_at, assigned_staff_id, status",
      )
      .order("last_message_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("messages")
      .select(
        "id, conversation_id, driver_id, kind, body, sender_profile_id, sender_name, twilio_sid, broadcast_id, created_at",
      )
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, role"),
    supabase
      .from("activity_events")
      .select("id, conversation_id, driver_id, staff_id, staff_name, kind, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const error =
    driversRes.error ??
    tagsRes.error ??
    driverTagsRes.error ??
    groupsRes.error ??
    driverGroupsRes.error ??
    convRes.error ??
    messagesRes.error ??
    profilesRes.error ??
    activityRes.error;
  if (error) throw new Error(error.message);

  const driverTags = (driverTagsRes.data ?? []) as DriverTagRow[];
  const tagsByDriver = new Map<string, string[]>();
  for (const row of driverTags) {
    const list = tagsByDriver.get(row.driver_id) ?? [];
    list.push(row.tag_id);
    tagsByDriver.set(row.driver_id, list);
  }

  const driverGroups = (driverGroupsRes.data ?? []) as DriverGroupRow[];
  const groupsByDriver = new Map<string, string[]>();
  for (const row of driverGroups) {
    const list = groupsByDriver.get(row.driver_id) ?? [];
    list.push(row.group_id);
    groupsByDriver.set(row.driver_id, list);
  }

  const conversations = ((convRes.data ?? []) as ConversationRow[]).map(mapConversation);
  const convByDriver = new Map(conversations.map((c) => [c.driverId, c]));
  const tagList = (tagsRes.data ?? []) as TagRow[];
  const groupList = (groupsRes.data ?? []) as GroupRow[];
  const tagsById = new Map(tagList.map((tag) => [tag.id, tag]));
  const groupsById = new Map(groupList.map((group) => [group.id, group]));

  const drivers = ((driversRes.data ?? []) as DriverRow[]).map((row) => {
    const conversation = convByDriver.get(row.id);
    const tagIds = tagsByDriver.get(row.id) ?? [];
    const groupIds = groupsByDriver.get(row.id) ?? [];
    const lastAt = conversation?.lastMessageAt ?? null;
    const lastPreview = conversation?.lastMessagePreview ?? null;
    const unread = conversation?.unreadCount ?? 0;
    return {
      id: row.id,
      fullName: row.full_name,
      full_name: row.full_name,
      phone: row.phone,
      notes: row.notes ?? undefined,
      driverCode: row.driver_code ?? "",
      truck: row.truck ?? "",
      terminal: row.terminal ?? "",
      tags: tagIds.map((id) => tagsById.get(id)).filter((tag): tag is TagRow => Boolean(tag)),
      tagIds,
      groups: groupIds
        .map((id) => groupsById.get(id))
        .filter((group): group is GroupRow => Boolean(group)),
      groupIds,
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

  const staffRoster = ((profilesRes.data ?? []) as ProfileRow[]).map((row) =>
    asProfile({
      id: row.id,
      name: row.full_name,
      role: normalizeRole(row.role),
    }),
  );

  const activityEvents: ActivityEvent[] = ((activityRes.data ?? []) as ActivityRow[]).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    driverId: row.driver_id,
    staffId: row.staff_id,
    staffName: row.staff_name,
    kind: row.kind,
    detail: row.detail,
    createdAt: row.created_at,
  }));

  return {
    staff,
    staffRoster,
    conversations,
    drivers,
    tags: tagList as Tag[],
    groups: groupList as ContactGroup[],
    messagesByConversation,
    activityEvents,
    presence: emptyPresence(),
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
    return {
      id: row.id,
      name: row.full_name,
      fullName: row.full_name,
      role: normalizeRole(row.role),
    };
  }

  async function refresh() {
    const staff = await currentStaff();
    const snap = await loadLiveSnapshot(staff);
    for (const listener of listeners) listener(snap);
    return snap;
  }

  async function insertActivity(params: {
    conversationId?: string | null;
    driverId?: string | null;
    actor: Profile;
    kind: ActivityEvent["kind"];
    detail: string;
  }) {
    const supabase = createBrowserSupabase();
    await supabase.from("activity_events").insert({
      conversation_id: params.conversationId ?? null,
      driver_id: params.driverId ?? null,
      staff_id: params.actor.id,
      staff_name: params.actor.fullName,
      kind: params.kind,
      detail: params.detail,
    });
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
        .update({ unread_count: 0, read_at: new Date().toISOString() })
        .eq("id", conversationId);
      if (error) throw new Error(error.message);
      await refresh();
    },
    async assignConversation(conversationId, staffId, actor) {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("conversations")
        .update({ assigned_staff_id: staffId })
        .eq("id", conversationId);
      if (error) throw new Error(error.message);
      await insertActivity({
        conversationId,
        actor,
        kind: staffId ? "assigned" : "unassigned",
        detail: staffId ? `Assigned by ${actor.fullName}` : `Unassigned by ${actor.fullName}`,
      });
      await refresh();
    },
    async setWorkflowStatus(conversationId, status, actor) {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from("conversations").update({ status }).eq("id", conversationId);
      if (error) throw new Error(error.message);
      await insertActivity({
        conversationId,
        actor,
        kind: "status_changed",
        detail: `Status changed by ${actor.fullName}`,
      });
      await refresh();
    },
    async updateContact(driverId, patch: ContactPatch, actor) {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("drivers")
        .update({
          full_name: patch.fullName,
          notes: patch.notes,
          driver_code: patch.driverCode,
          truck: patch.truck,
          terminal: patch.terminal,
        })
        .eq("id", driverId);
      if (error) throw new Error(error.message);
      await insertActivity({
        driverId,
        actor,
        kind: "contact_updated",
        detail: `Updated contact by ${actor.fullName}`,
      });
      await refresh();
    },
    async setContactGroups(driverId, groupIds, actor) {
      const supabase = createBrowserSupabase();
      const { error: delError } = await supabase.from("driver_groups").delete().eq("driver_id", driverId);
      if (delError) throw new Error(delError.message);
      if (groupIds.length > 0) {
        const { error } = await supabase
          .from("driver_groups")
          .insert(groupIds.map((group_id) => ({ driver_id: driverId, group_id })));
        if (error) throw new Error(error.message);
      }
      await insertActivity({
        driverId,
        actor,
        kind: "groups_changed",
        detail: `Groups updated by ${actor.fullName}`,
      });
      await refresh();
    },
    async createGroup(name, color, actor) {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("contact_groups")
        .insert({ name, color })
        .select("id, name, color")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Could not create group");
      await insertActivity({
        actor,
        kind: "group_created",
        detail: `Created group ${name}`,
      });
      await refresh();
      return data as ContactGroup;
    },
    async updateGroup(groupId, patch, actor) {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from("contact_groups").update(patch).eq("id", groupId);
      if (error) throw new Error(error.message);
      await insertActivity({
        actor,
        kind: "group_updated",
        detail: `Updated group by ${actor.fullName}`,
      });
      await refresh();
    },
    async simulateInbound() {
      throw new Error("Simulate inbound is a demo-only control.");
    },
    publishPresence(_entry: {
      staffId: string;
      staffName: string;
      conversationId: string;
      mode: PresenceMode;
    } | null) {
      /* Presence is ephemeral and not persisted. Live desks would use a realtime channel. */
    },
    resetDemo() {
      /* Live workspaces are not reset from the client. */
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
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
          void refresh();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
          void refresh();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "activity_events" }, () => {
          void refresh();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "driver_groups" }, () => {
          void refresh();
        })
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
