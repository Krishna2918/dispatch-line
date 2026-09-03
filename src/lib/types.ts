export type MessageKind = "sms_in" | "sms_out" | "internal_note";
export type StaffRole = "dispatcher" | "admin";
export type ComposerMode = "sms" | "note";

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

export type Driver = {
  id: string;
  fullName: string;
  full_name: string;
  phone: string;
  notes?: string;
  tags: Tag[];
  tagIds: string[];
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
  recipientCount: number;
  createdAt: string;
};

export type InboxSnapshot = {
  staff: Profile;
  conversations: Conversation[];
  drivers: Driver[];
  tags: Tag[];
  messagesByConversation: Record<string, Message[]>;
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
  tagIds: string[];
  sender: Profile;
};

export type InboxClient = {
  getSnapshot(): Promise<InboxSnapshot>;
  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  sendBroadcast(input: BroadcastInput): Promise<Broadcast>;
  markRead(conversationId: string): Promise<void>;
  subscribe(cb: (snap: InboxSnapshot) => void): () => void;
};

export function asProfile(staff: Staff): Profile {
  return {
    id: staff.id,
    name: staff.name,
    fullName: "fullName" in staff && typeof staff.fullName === "string" ? staff.fullName : staff.name,
    role: staff.role,
  };
}
