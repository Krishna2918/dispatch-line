export type MessageKind = "sms_in" | "sms_out" | "internal_note";
export type StaffRole = "dispatcher" | "admin" | "manager" | "readonly";
export type ComposerMode = "sms" | "note";
export type WorkflowStatus =
  | "new"
  | "open"
  | "in_progress"
  | "waiting_for_driver"
  | "resolved";
export type PresenceMode = "viewing" | "replying";
export type ActivityKind =
  | "assigned"
  | "unassigned"
  | "groups_changed"
  | "status_changed"
  | "contact_updated"
  | "group_created"
  | "group_updated";
export type AssignmentFilter = "all" | "me" | "unassigned" | string;
export type ReadFilter = "all" | "unread" | "read";
export type StatusFilter = "all" | WorkflowStatus;
export type DateFilter = "all" | "today";

export const WORKFLOW_STATUSES: WorkflowStatus[] = [
  "new",
  "open",
  "in_progress",
  "waiting_for_driver",
  "resolved",
];

export type Staff = {
  id: string;
  name: string;
  role: StaffRole;
};

export type Profile = Staff & {
  fullName: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type ContactGroup = {
  id: string;
  name: string;
  color: string;
};

export type Driver = {
  id: string;
  fullName: string;
  full_name: string;
  phone: string;
  notes?: string;
  driverCode: string;
  truck: string;
  terminal: string;
  tags: Tag[];
  tagIds: string[];
  groups: ContactGroup[];
  groupIds: string[];
  lastMessageAt: string | null;
  last_message_at: string;
  lastMessagePreview: string | null;
  last_message_preview: string;
  unreadCount: number;
  unread_count: number;
};

export type Conversation = {
  id: string;
  driverId: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  readAt: string | null;
  assignedStaffId: string | null;
  status: WorkflowStatus;
};

export type Message = {
  id: string;
  conversationId: string;
  conversation_id: string;
  driverId: string;
  kind: MessageKind;
  body: string;
  senderProfileId: string | null;
  senderName: string | null;
  sender_name: string | null;
  twilioSid: string | null;
  broadcastId: string | null;
  broadcast_id?: string | null;
  createdAt: string;
  created_at: string;
};

export type Broadcast = {
  id: string;
  createdBy: string;
  createdByName: string;
  body: string;
  tagIds: string[];
  groupIds: string[];
  recipientCount: number;
  createdAt: string;
};

export type ActivityEvent = {
  id: string;
  conversationId: string | null;
  driverId: string | null;
  staffId: string;
  staffName: string;
  kind: ActivityKind;
  detail: string;
  createdAt: string;
};

export type PresenceEntry = {
  tabId: string;
  staffId: string;
  staffName: string;
  conversationId: string;
  mode: PresenceMode;
  updatedAt: number;
};

export type InboxSnapshot = {
  staff: Profile;
  staffRoster: Profile[];
  conversations: Conversation[];
  drivers: Driver[];
  tags: Tag[];
  groups: ContactGroup[];
  messagesByConversation: Record<string, Message[]>;
  activityEvents: ActivityEvent[];
  presence: PresenceEntry[];
};

export type SendMessageInput = {
  conversationId: string;
  driverId: string;
  body: string;
  kind: "sms_out" | "internal_note";
  sender: Profile;
};

export type BroadcastInput = {
  body: string;
  tagIds?: string[];
  groupIds?: string[];
  sender: Profile;
};

export type ContactPatch = {
  fullName?: string;
  notes?: string;
  driverCode?: string;
  truck?: string;
  terminal?: string;
};

export type InboxClient = {
  getSnapshot(): Promise<InboxSnapshot>;
  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  sendBroadcast(input: BroadcastInput): Promise<Broadcast>;
  markRead(conversationId: string): Promise<void>;
  assignConversation(
    conversationId: string,
    staffId: string | null,
    actor: Profile,
  ): Promise<void>;
  setWorkflowStatus(
    conversationId: string,
    status: WorkflowStatus,
    actor: Profile,
  ): Promise<void>;
  updateContact(driverId: string, patch: ContactPatch, actor: Profile): Promise<void>;
  setContactGroups(driverId: string, groupIds: string[], actor: Profile): Promise<void>;
  createGroup(name: string, color: string, actor: Profile): Promise<ContactGroup>;
  updateGroup(
    groupId: string,
    patch: { name?: string; color?: string },
    actor: Profile,
  ): Promise<void>;
  simulateInbound(conversationId: string, body?: string): Promise<Message>;
  publishPresence(
    entry: {
      staffId: string;
      staffName: string;
      conversationId: string;
      mode: PresenceMode;
    } | null,
  ): void;
  resetDemo(): void;
  subscribe(cb: (snap: InboxSnapshot) => void): () => void;
};

export function normalizeRole(role: unknown): StaffRole {
  if (role === "admin" || role === "dispatcher" || role === "manager" || role === "readonly") {
    return role;
  }
  return "dispatcher";
}

export function asProfile(staff: Staff | Profile): Profile {
  const name =
    "fullName" in staff && typeof staff.fullName === "string" && staff.fullName.trim()
      ? staff.fullName
      : staff.name;
  return {
    id: staff.id,
    name: staff.name || name,
    fullName: name,
    role: normalizeRole(staff.role),
  };
}
