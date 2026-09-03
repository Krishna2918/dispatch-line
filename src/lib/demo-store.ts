import { cloneDemoState, makeMessage, type DemoState } from "./demo-data";
import { toE164 } from "./phone";
import type {
  Broadcast,
  BroadcastInput,
  Driver,
  InboxSnapshot,
  Message,
  Profile,
  SendMessageInput,
  Tag,
} from "./types";

const STORAGE_KEY = "dispatch-line-demo-v1";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function previewOf(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 160);
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

export class DemoStore {
  private state: DemoState;
  private listeners = new Set<(snap: InboxSnapshot) => void>();
  private persistable: boolean;

  constructor(options?: { persist?: boolean }) {
    this.persistable = Boolean(options?.persist && typeof window !== "undefined");
    this.state = this.load() ?? cloneDemoState();
  }

  private load(): DemoState | null {
    if (!this.persistable) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DemoState;
      if (!parsed?.drivers?.length || !parsed?.messages?.length) return null;
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

  private emit() {
    const snap = this.snapshot(this.currentStaff());
    for (const listener of this.listeners) listener(snap);
  }

  currentStaff(): Profile {
    return this.state.staff[0];
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
      conversations,
      drivers: this.state.drivers,
      tags: this.state.tags,
      messagesByConversation,
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

  sendMessage(input: SendMessageInput): Message {
    const body = input.body.trim();
    if (!body) throw new Error("Message body is required");
    const conversation = this.state.conversations.find(
      (c) => c.id === input.conversationId || c.driverId === input.conversationId,
    );
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
    this.persist();
    this.emit();
    return message;
  }

  sendBroadcast(input: BroadcastInput): Broadcast {
    const body = input.body.trim();
    if (!body) throw new Error("Broadcast body is required");
    if (input.tagIds.length === 0) throw new Error("Select at least one tag");

    const createdAt = new Date().toISOString();
    const recipients = this.state.drivers.filter((driver) =>
      driver.tagIds.some((tagId) => input.tagIds.includes(tagId)),
    );
    const broadcast: Broadcast = {
      id: newId(),
      createdBy: input.sender.id,
      createdByName: input.sender.name,
      body,
      tagIds: input.tagIds,
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

    this.persist();
    this.emit();
    return broadcast;
  }

  markRead(conversationId: string) {
    const conversation = this.state.conversations.find(
      (c) => c.id === conversationId || c.driverId === conversationId,
    );
    if (conversation) conversation.unreadCount = 0;
    const driver = this.state.drivers.find(
      (d) => d.id === conversationId || d.id === conversation?.driverId,
    );
    if (driver) {
      driver.unreadCount = 0;
      driver.unread_count = 0;
    }
    this.persist();
    this.emit();
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
        tags: emptyTags,
        tagIds: [],
        lastMessageAt: createdAt,
        last_message_at: createdAt,
        lastMessagePreview: previewOf(body),
        last_message_preview: previewOf(body),
        unreadCount: 1,
        unread_count: 1,
      };
      this.state.drivers.push(driver);
      this.state.conversations.push({
        id: newId(),
        driverId: driver.id,
        lastMessageAt: createdAt,
        lastMessagePreview: previewOf(body),
        unreadCount: 1,
      });
    }

    const message = makeMessage({
      id: newId(),
      conversationId: driver.id,
      driverId: driver.id,
      kind: "sms_in",
      body,
      createdAt,
      twilioSid: params.twilioSid ?? `SM_in_${newId()}`,
    });
    this.state.messages.push(message);
    this.touchConversation(driver.id, driver.id, body, createdAt, true);
    this.persist();
    this.emit();
    return message;
  }

  private touchConversation(
    conversationId: string,
    driverId: string,
    body: string,
    createdAt: string,
    inbound: boolean,
  ) {
    const preview = previewOf(body);
    const conversation = this.state.conversations.find(
      (c) => c.id === conversationId || c.driverId === driverId,
    );
    if (conversation) {
      conversation.lastMessageAt = createdAt;
      conversation.lastMessagePreview = preview;
      if (inbound) conversation.unreadCount += 1;
    }
    const driver = this.state.drivers.find((d) => d.id === driverId);
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
