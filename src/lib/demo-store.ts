import {
  assertCanEditContacts,
  assertCanEditWorkflow,
  assertCanManageGroups,
  assertCanSend,
} from "./permissions";
import { getDemoStaff } from "./auth";
import {
  C_JOHN,
  cloneDemoState,
  DEMO_STATE_VERSION,
  isDemoState,
  JOHN_INBOUND_BODY,
  makeMessage,
  type DemoState,
} from "./demo-data";
import { toE164 } from "./phone";
import type {
  ActivityEvent,
  ActivityKind,
  Broadcast,
  BroadcastInput,
  ContactGroup,
  ContactPatch,
  Conversation,
  Driver,
  InboxSnapshot,
  Message,
  PresenceEntry,
  PresenceMode,
  Profile,
  SendMessageInput,
  Tag,
  WorkflowStatus,
} from "./types";
import { asProfile, WORKFLOW_STATUSES } from "./types";

export const STORAGE_KEY = "dispatch-line-demo-v3";
export const CHANNEL_NAME = "dispatch-line-shared-v3";

const PRESENCE_TTL_MS = 6000;
const PRESENCE_HEARTBEAT_MS = 2000;

type ChannelStateMessage = {
  type: "state";
  state: DemoState;
};

type ChannelPresenceMessage = {
  type: "presence";
  entry: PresenceEntry | null;
  tabId: string;
};

type ChannelMessage = ChannelStateMessage | ChannelPresenceMessage;

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function previewOf(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 160);
}

function statusLabel(status: WorkflowStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "waiting_for_driver":
      return "Waiting for Driver";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
}

function touchDriver(driver: Driver, body: string, createdAt: string, inbound: boolean) {
  const preview = previewOf(body);
  driver.lastMessageAt = createdAt;
  driver.last_message_at = createdAt;
  driver.lastMessagePreview = preview;
  driver.last_message_preview = preview;
  if (inbound) {
    driver.unreadCount += 1;
    driver.unread_count += 1;
  }
}

function hydrateDriver(driver: Driver, groups: ContactGroup[], tags: Tag[]): Driver {
  const groupIds = driver.groupIds ?? driver.groups?.map((group) => group.id) ?? [];
  const tagIds = driver.tagIds ?? driver.tags?.map((tag) => tag.id) ?? [];
  return {
    ...driver,
    groupIds,
    tagIds,
    groups: groups.filter((group) => groupIds.includes(group.id)),
    tags: tags.filter((tag) => tagIds.includes(tag.id)),
    fullName: driver.fullName || driver.full_name,
    full_name: driver.full_name || driver.fullName,
    driverCode: driver.driverCode ?? "",
    truck: driver.truck ?? "",
    terminal: driver.terminal ?? "",
  };
}

export class DemoStore {
  private state: DemoState;
  private listeners = new Set<(snap: InboxSnapshot) => void>();
  private persistable: boolean;
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private presenceByTab = new Map<string, PresenceEntry>();
  private localPresence: PresenceEntry | null = null;
  private heartbeat: number | null = null;

  constructor(options?: { persist?: boolean }) {
    this.persistable = Boolean(options?.persist && typeof window !== "undefined");
    this.tabId = newId();
    this.state = this.load() ?? cloneDemoState();
    this.bindSync();
  }

  private load(): DemoState | null {
    if (!this.persistable) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (!isDemoState(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private persist() {
    if (!this.persistable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* quota / private mode */
    }
  }

  private broadcastState() {
    try {
      this.channel?.postMessage({ type: "state", state: this.state } satisfies ChannelStateMessage);
    } catch {
      /* channel closed */
    }
  }

  private commit() {
    this.persist();
    this.broadcastState();
    this.emit();
  }

  private emit() {
    const snap = this.snapshot(this.currentStaff());
    for (const listener of this.listeners) listener(snap);
  }

  private bindSync() {
    if (!this.persistable || typeof window === "undefined") return;

    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
        const data = event.data;
        if (!data || typeof data !== "object") return;
        if (data.type === "state" && isDemoState(data.state)) {
          this.state = data.state;
          this.emit();
        }
        if (data.type === "presence") {
          this.applyRemotePresence(data.tabId, data.entry);
          this.emit();
        }
      };
    } catch {
      this.channel = null;
    }

    window.addEventListener("storage", this.onStorage);
    window.addEventListener("beforeunload", this.onUnload);
    this.heartbeat = window.setInterval(() => {
      this.prunePresence();
      if (this.localPresence) {
        this.localPresence = { ...this.localPresence, updatedAt: Date.now() };
        this.presenceByTab.set(this.tabId, this.localPresence);
        this.broadcastPresence(this.localPresence);
      }
      this.emit();
    }, PRESENCE_HEARTBEAT_MS);
  }

  private onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as unknown;
      if (!isDemoState(parsed)) return;
      this.state = parsed;
      this.emit();
    } catch {
      /* ignore */
    }
  };

  private onUnload = () => {
    this.publishPresence(null);
  };

  private applyRemotePresence(tabId: string, entry: PresenceEntry | null) {
    if (!entry) {
      this.presenceByTab.delete(tabId);
      return;
    }
    this.presenceByTab.set(tabId, entry);
  }

  private broadcastPresence(entry: PresenceEntry | null) {
    try {
      this.channel?.postMessage({
        type: "presence",
        tabId: this.tabId,
        entry,
      } satisfies ChannelPresenceMessage);
    } catch {
      /* channel closed */
    }
  }

  private prunePresence() {
    const cutoff = Date.now() - PRESENCE_TTL_MS;
    for (const [tabId, entry] of this.presenceByTab) {
      if (entry.updatedAt < cutoff) this.presenceByTab.delete(tabId);
    }
  }

  private livePresence(): PresenceEntry[] {
    this.prunePresence();
    return [...this.presenceByTab.values()];
  }

  currentStaff(): Profile {
    return getDemoStaff();
  }

  snapshot(staff: Profile): InboxSnapshot {
    const conversations = [...this.state.conversations].sort((a, b) => {
      const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
      const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
      return tb - ta;
    });
    const messagesByConversation: InboxSnapshot["messagesByConversation"] = {};
    for (const message of this.state.messages) {
      const key = message.conversation_id;
      const list = messagesByConversation[key] ?? [];
      list.push(message);
      messagesByConversation[key] = list;
    }
    for (const list of Object.values(messagesByConversation)) {
      list.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    }
    return {
      staff,
      staffRoster: this.state.staff.map((row) => asProfile(row)),
      conversations,
      drivers: this.state.drivers.map((row) =>
        hydrateDriver(row, this.state.groups, this.state.tags),
      ),
      tags: this.state.tags,
      groups: this.state.groups,
      messagesByConversation,
      activityEvents: [...this.state.activityEvents].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
      presence: this.livePresence(),
    };
  }

  subscribe(cb: (snap: InboxSnapshot) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  listMessages(conversationId: string): Message[] {
    return this.state.messages
      .filter((m) => m.conversation_id === conversationId || m.driverId === conversationId)
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  }

  private findConversation(conversationId: string): Conversation | undefined {
    return this.state.conversations.find(
      (c) => c.id === conversationId || c.driverId === conversationId,
    );
  }

  private findDriver(id: string): Driver | undefined {
    return this.state.drivers.find((d) => d.id === id);
  }

  private recordActivity(partial: {
    conversationId?: string | null;
    driverId?: string | null;
    actor: Profile;
    kind: ActivityKind;
    detail: string;
  }) {
    const event: ActivityEvent = {
      id: newId(),
      conversationId: partial.conversationId ?? null,
      driverId: partial.driverId ?? null,
      staffId: partial.actor.id,
      staffName: partial.actor.fullName,
      kind: partial.kind,
      detail: partial.detail,
      createdAt: new Date().toISOString(),
    };
    this.state.activityEvents.push(event);
  }

  sendMessage(input: SendMessageInput): Message {
    assertCanSend(input.sender);
    const body = input.body.trim();
    if (!body) throw new Error("Message body is required");
    const conversation = this.findConversation(input.conversationId);
    const driverId = conversation?.driverId ?? input.driverId;
    const threadId = conversation?.id ?? input.conversationId;
    const createdAt = new Date().toISOString();
    const message = makeMessage({
      id: newId(),
      conversationId: threadId,
      driverId,
      kind: input.kind,
      body,
      createdAt,
      sender: input.sender,
      twilioSid: input.kind === "sms_out" ? `SM_demo_${newId()}` : null,
    });
    this.state.messages.push(message);
    this.touchConversation(threadId, driverId, body, createdAt, false);
    this.commit();
    return message;
  }

  sendBroadcast(input: BroadcastInput): Broadcast {
    assertCanSend(input.sender);
    const body = input.body.trim();
    if (!body) throw new Error("Broadcast body is required");
    const groupIds = input.groupIds ?? [];
    const tagIds = input.tagIds ?? [];
    if (groupIds.length === 0 && tagIds.length === 0) {
      throw new Error("Select at least one group");
    }

    const createdAt = new Date().toISOString();
    const recipients = this.state.drivers.filter(
      (driver) =>
        driver.groupIds.some((id) => groupIds.includes(id)) ||
        driver.tagIds.some((id) => tagIds.includes(id)),
    );
    const broadcast: Broadcast = {
      id: newId(),
      createdBy: input.sender.id,
      createdByName: input.sender.name,
      body,
      tagIds,
      groupIds,
      recipientCount: recipients.length,
      createdAt,
    };
    this.state.broadcasts.push(broadcast);

    for (const driver of recipients) {
      const conversation = this.state.conversations.find((c) => c.driverId === driver.id);
      const threadId = conversation?.id ?? driver.id;
      const message = makeMessage({
        id: newId(),
        conversationId: threadId,
        driverId: driver.id,
        kind: "sms_out",
        body,
        createdAt,
        sender: input.sender,
        twilioSid: `SM_demo_bc_${newId()}`,
        broadcastId: broadcast.id,
      });
      this.state.messages.push(message);
      this.touchConversation(threadId, driver.id, body, createdAt, false);
    }

    this.commit();
    return broadcast;
  }

  markRead(conversationId: string) {
    const conversation = this.findConversation(conversationId);
    const readAt = new Date().toISOString();
    if (conversation) {
      conversation.unreadCount = 0;
      conversation.readAt = readAt;
    }
    const driver = this.findDriver(conversationId) ?? this.findDriver(conversation?.driverId ?? "");
    if (driver) {
      driver.unreadCount = 0;
      driver.unread_count = 0;
    }
    this.commit();
  }

  assignConversation(conversationId: string, staffId: string | null, actor: Profile) {
    assertCanEditWorkflow(actor);
    const conversation = this.findConversation(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    conversation.assignedStaffId = staffId;
    const assignee = staffId ? this.state.staff.find((row) => row.id === staffId) : null;
    this.recordActivity({
      conversationId: conversation.id,
      driverId: conversation.driverId,
      actor,
      kind: staffId ? "assigned" : "unassigned",
      detail: staffId ? `Assigned to ${assignee?.fullName ?? assignee?.name ?? "staff"}` : "Unassigned",
    });
    this.commit();
  }

  setWorkflowStatus(conversationId: string, status: WorkflowStatus, actor: Profile) {
    assertCanEditWorkflow(actor);
    if (!WORKFLOW_STATUSES.includes(status)) throw new Error("Invalid status");
    const conversation = this.findConversation(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    conversation.status = status;
    this.recordActivity({
      conversationId: conversation.id,
      driverId: conversation.driverId,
      actor,
      kind: "status_changed",
      detail: `Status → ${statusLabel(status)}`,
    });
    this.commit();
  }

  updateContact(driverId: string, patch: ContactPatch, actor: Profile) {
    assertCanEditContacts(actor);
    const driver = this.findDriver(driverId);
    if (!driver) throw new Error("Contact not found");
    if (patch.fullName?.trim()) {
      driver.fullName = patch.fullName.trim();
      driver.full_name = driver.fullName;
    }
    if (patch.notes !== undefined) driver.notes = patch.notes;
    if (patch.driverCode !== undefined) driver.driverCode = patch.driverCode;
    if (patch.truck !== undefined) driver.truck = patch.truck;
    if (patch.terminal !== undefined) driver.terminal = patch.terminal;
    const conversation = this.state.conversations.find((c) => c.driverId === driver.id);
    this.recordActivity({
      conversationId: conversation?.id ?? null,
      driverId: driver.id,
      actor,
      kind: "contact_updated",
      detail: `Updated ${driver.fullName}`,
    });
    this.commit();
  }

  setContactGroups(driverId: string, groupIds: string[], actor: Profile) {
    assertCanEditContacts(actor);
    const driver = this.findDriver(driverId);
    if (!driver) throw new Error("Contact not found");
    const unique = [...new Set(groupIds)].filter((id) =>
      this.state.groups.some((group) => group.id === id),
    );
    driver.groupIds = unique;
    driver.groups = this.state.groups.filter((group) => unique.includes(group.id));
    const names =
      driver.groups.map((group) => group.name).join(", ") || "no groups";
    const conversation = this.state.conversations.find((c) => c.driverId === driver.id);
    this.recordActivity({
      conversationId: conversation?.id ?? null,
      driverId: driver.id,
      actor,
      kind: "groups_changed",
      detail: `Groups → ${names}`,
    });
    this.commit();
  }

  createGroup(name: string, color: string, actor: Profile): ContactGroup {
    assertCanManageGroups(actor);
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Group name is required");
    if (this.state.groups.some((group) => group.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("A group with that name already exists");
    }
    const group: ContactGroup = { id: newId(), name: trimmed, color: color || "#c9a227" };
    this.state.groups.push(group);
    this.recordActivity({
      actor,
      kind: "group_created",
      detail: `Created group ${group.name}`,
    });
    this.commit();
    return group;
  }

  updateGroup(groupId: string, patch: { name?: string; color?: string }, actor: Profile) {
    assertCanManageGroups(actor);
    const group = this.state.groups.find((row) => row.id === groupId);
    if (!group) throw new Error("Group not found");
    if (patch.name?.trim()) group.name = patch.name.trim();
    if (patch.color) group.color = patch.color;
    this.recordActivity({
      actor,
      kind: "group_updated",
      detail: `Updated group ${group.name}`,
    });
    this.commit();
  }

  simulateInbound(conversationId: string, body?: string): Message {
    const conversation = this.findConversation(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    const driver = this.findDriver(conversation.driverId);
    if (!driver) throw new Error("Contact not found");
    const text =
      body?.trim() ||
      (conversation.id === C_JOHN || driver.id === conversation.driverId && conversation.id === C_JOHN
        ? JOHN_INBOUND_BODY
        : "Checking in from the yard.");
    const finalBody =
      !body?.trim() && conversation.id === C_JOHN ? JOHN_INBOUND_BODY : text;
    return this.ingestInbound({
      from: driver.phone,
      body: finalBody,
    });
  }

  /** Driver-portal inbound. Same store, same conversation, fans out over BroadcastChannel. */
  appendInbound(driverId: string, body: string): Message;
  appendInbound(params: { from: string; body: string; twilioSid?: string | null }): Message;
  appendInbound(
    driverIdOrParams: string | { from: string; body: string; twilioSid?: string | null },
    body?: string,
  ): Message {
    if (typeof driverIdOrParams === "string") {
      const driver = this.findDriver(driverIdOrParams);
      if (!driver) throw new Error("Driver not found");
      const text = body?.trim() ?? "";
      if (!text) throw new Error("Message body is required");
      return this.ingestInbound({ from: driver.phone, body: text });
    }
    return this.ingestInbound(driverIdOrParams);
  }

  ingestInbound(params: { from: string; body: string; twilioSid?: string | null }): Message {
    const phone = toE164(params.from);
    const body = params.body.trim() || "(empty)";
    const createdAt = new Date().toISOString();

    if (params.twilioSid) {
      const existing = this.state.messages.find((m) => m.twilioSid === params.twilioSid);
      if (existing) return existing;
    }

    let driver = this.state.drivers.find((d) => d.phone === phone);
    if (!driver) {
      const emptyTags: Tag[] = [];
      driver = {
        id: newId(),
        fullName: `Unknown ${phone}`,
        full_name: `Unknown ${phone}`,
        phone,
        driverCode: "",
        truck: "",
        terminal: "",
        tags: emptyTags,
        tagIds: [],
        groups: [],
        groupIds: [],
        lastMessageAt: createdAt,
        last_message_at: createdAt,
        lastMessagePreview: previewOf(body),
        last_message_preview: previewOf(body),
        unreadCount: 0,
        unread_count: 0,
      };
      this.state.drivers.push(driver);
      this.state.conversations.push({
        id: newId(),
        driverId: driver.id,
        lastMessageAt: createdAt,
        lastMessagePreview: previewOf(body),
        unreadCount: 0,
        readAt: null,
        assignedStaffId: null,
        status: "new",
      });
    }

    const conversation = this.state.conversations.find((c) => c.driverId === driver.id);
    const threadId = conversation?.id ?? driver.id;
    const message = makeMessage({
      id: newId(),
      conversationId: threadId,
      driverId: driver.id,
      kind: "sms_in",
      body,
      createdAt,
      twilioSid: params.twilioSid ?? `SM_in_${newId()}`,
    });
    this.state.messages.push(message);
    this.touchConversation(threadId, driver.id, body, createdAt, true);
    this.commit();
    return message;
  }

  publishPresence(
    entry: {
      staffId: string;
      staffName: string;
      conversationId: string;
      mode: PresenceMode;
    } | null,
  ) {
    if (!entry) {
      this.localPresence = null;
      this.presenceByTab.delete(this.tabId);
      this.broadcastPresence(null);
      this.emit();
      return;
    }
    const next: PresenceEntry = {
      tabId: this.tabId,
      staffId: entry.staffId,
      staffName: entry.staffName,
      conversationId: entry.conversationId,
      mode: entry.mode,
      updatedAt: Date.now(),
    };
    this.localPresence = next;
    this.presenceByTab.set(this.tabId, next);
    this.broadcastPresence(next);
    this.emit();
  }

  resetDemo() {
    this.state = cloneDemoState();
    this.state.version = DEMO_STATE_VERSION;
    this.commit();
  }

  dispose() {
    if (this.heartbeat !== null && typeof window !== "undefined") {
      window.clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.onStorage);
      window.removeEventListener("beforeunload", this.onUnload);
    }
    try {
      this.channel?.close();
    } catch {
      /* ignore */
    }
    this.channel = null;
  }

  private touchConversation(
    conversationId: string,
    driverId: string,
    body: string,
    createdAt: string,
    inbound: boolean,
  ) {
    const preview = previewOf(body);
    const conversation = this.findConversation(conversationId) ?? this.findConversation(driverId);
    if (conversation) {
      conversation.lastMessageAt = createdAt;
      conversation.lastMessagePreview = preview;
      if (inbound) {
        conversation.unreadCount += 1;
        conversation.readAt = null;
      }
    }
    const driver = this.findDriver(driverId);
    if (driver) touchDriver(driver, body, createdAt, inbound);
  }
}

let browserStore: DemoStore | null = null;
let serverStore: DemoStore | null = null;

export function getDemoStore(): DemoStore {
  if (typeof window !== "undefined") {
    browserStore ??= new DemoStore({ persist: true });
    return browserStore;
  }
  serverStore ??= new DemoStore({ persist: false });
  return serverStore;
}

export function appendInbound(driverId: string, body: string): Message {
  return getDemoStore().appendInbound(driverId, body);
}
