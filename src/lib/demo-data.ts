import { asProfile, type Broadcast, type Conversation, type Driver, type Message, type Profile, type Tag } from "./types";

export const DEMO_STAFF_ROSTER: Profile[] = [
  asProfile({ id: "11111111-1111-1111-1111-111111111111", name: "Maya Chen", role: "dispatcher" }),
  asProfile({ id: "22222222-2222-2222-2222-222222222222", name: "Jordan Hale", role: "dispatcher" }),
  asProfile({ id: "33333333-3333-3333-3333-333333333333", name: "Priya Shah", role: "admin" }),
];

/** Roster used by the demo login. Also the default dispatcher is [0]. */
export const DEMO_STAFF: Profile[] = DEMO_STAFF_ROSTER;
export const DEMO_DISPATCHER: Profile = DEMO_STAFF_ROSTER[0];

export const TAG_US_ROUTE: Tag = {
  id: "44444444-4444-4444-4444-444444444441",
  name: "US Route",
  color: "#3d7ea6",
};

export const TAG_HAZMAT: Tag = {
  id: "44444444-4444-4444-4444-444444444442",
  name: "Hazmat",
  color: "#c45c26",
};

export const DEMO_TAGS: Tag[] = [TAG_US_ROUTE, TAG_HAZMAT];

const MAYA = DEMO_STAFF_ROSTER[0];
const JORDAN = DEMO_STAFF_ROSTER[1];
const PRIYA = DEMO_STAFF_ROSTER[2];

const D_LUIS = "55555555-5555-5555-5555-555555555551";
const D_DANA = "55555555-5555-5555-5555-555555555552";
const D_MARCUS = "55555555-5555-5555-5555-555555555553";
const D_KEISHA = "55555555-5555-5555-5555-555555555554";
const D_TOM = "55555555-5555-5555-5555-555555555555";

const C_LUIS = "66666666-6666-6666-6666-666666666661";
const C_DANA = "66666666-6666-6666-6666-666666666662";
const C_MARCUS = "66666666-6666-6666-6666-666666666663";
const C_KEISHA = "66666666-6666-6666-6666-666666666664";
const C_TOM = "66666666-6666-6666-6666-666666666665";

function driver(partial: {
  id: string;
  fullName: string;
  phone: string;
  notes?: string;
  tags: Tag[];
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
}): Driver {
  return {
    id: partial.id,
    fullName: partial.fullName,
    full_name: partial.fullName,
    phone: partial.phone,
    notes: partial.notes,
    tags: partial.tags,
    tagIds: partial.tags.map((tag) => tag.id),
    lastMessageAt: partial.lastMessageAt,
    last_message_at: partial.lastMessageAt,
    lastMessagePreview: partial.lastMessagePreview,
    last_message_preview: partial.lastMessagePreview,
    unreadCount: partial.unreadCount,
    unread_count: partial.unreadCount,
  };
}

export const DEMO_DRIVERS: Driver[] = [
  driver({
    id: D_LUIS,
    fullName: "Luis Ortega",
    phone: "+14155550101",
    notes: "I-55 Chicago–St. Louis relay. Prefers check-calls by text.",
    tags: [TAG_US_ROUTE],
    lastMessageAt: "2026-09-03T16:42:00.000Z",
    lastMessagePreview: "Scale was green. 20 out.",
    unreadCount: 1,
  }),
  driver({
    id: D_DANA,
    fullName: "Dana Whitaker",
    phone: "+14155550102",
    notes: "Tanker / chlorine qualified.",
    tags: [TAG_US_ROUTE, TAG_HAZMAT],
    lastMessageAt: "2026-09-03T15:18:00.000Z",
    lastMessagePreview: "All three on. Leaving the terminal now.",
    unreadCount: 0,
  }),
  driver({
    id: D_MARCUS,
    fullName: "Marcus Bell",
    phone: "+14155550103",
    notes: "Hazmat only. Watch detention.",
    tags: [TAG_HAZMAT],
    lastMessageAt: "2026-09-03T14:05:00.000Z",
    lastMessagePreview: "Need a new BOL, the shipper signed the wrong one",
    unreadCount: 1,
  }),
  driver({
    id: D_KEISHA,
    fullName: "Keisha Rowe",
    phone: "+14155550104",
    tags: [TAG_US_ROUTE],
    lastMessageAt: "2026-09-03T13:40:00.000Z",
    lastMessagePreview: "Deadhead to CIN. Live load at 18:00, Pro# 88421.",
    unreadCount: 0,
  }),
  driver({
    id: D_TOM,
    fullName: "Tom Nguyen",
    phone: "+13125550105",
    notes: "Local / shop overflow. Truck 17.",
    tags: [],
    lastMessageAt: "2026-09-03T12:11:00.000Z",
    lastMessagePreview: "Truck 17 check engine light. Still running.",
    unreadCount: 0,
  }),
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  { id: C_LUIS, driverId: D_LUIS, lastMessageAt: DEMO_DRIVERS[0].lastMessageAt, lastMessagePreview: DEMO_DRIVERS[0].lastMessagePreview, unreadCount: 1 },
  { id: C_DANA, driverId: D_DANA, lastMessageAt: DEMO_DRIVERS[1].lastMessageAt, lastMessagePreview: DEMO_DRIVERS[1].lastMessagePreview, unreadCount: 0 },
  { id: C_MARCUS, driverId: D_MARCUS, lastMessageAt: DEMO_DRIVERS[2].lastMessageAt, lastMessagePreview: DEMO_DRIVERS[2].lastMessagePreview, unreadCount: 1 },
  { id: C_KEISHA, driverId: D_KEISHA, lastMessageAt: DEMO_DRIVERS[3].lastMessageAt, lastMessagePreview: DEMO_DRIVERS[3].lastMessagePreview, unreadCount: 0 },
  { id: C_TOM, driverId: D_TOM, lastMessageAt: DEMO_DRIVERS[4].lastMessageAt, lastMessagePreview: DEMO_DRIVERS[4].lastMessagePreview, unreadCount: 0 },
];

export function makeMessage(partial: {
  id: string;
  conversationId: string;
  driverId: string;
  kind: Message["kind"];
  body: string;
  createdAt: string;
  sender?: Profile;
  twilioSid?: string | null;
  broadcastId?: string | null;
}): Message {
  return {
    id: partial.id,
    conversationId: partial.conversationId,
    conversation_id: partial.conversationId,
    driverId: partial.driverId,
    kind: partial.kind,
    body: partial.body,
    senderProfileId: partial.sender?.id ?? null,
    senderName: partial.sender?.name ?? null,
    sender_name: partial.sender?.name ?? null,
    twilioSid: partial.twilioSid ?? null,
    broadcastId: partial.broadcastId ?? null,
    broadcast_id: partial.broadcastId ?? null,
    createdAt: partial.createdAt,
    created_at: partial.createdAt,
  };
}

export const DEMO_MESSAGES: Message[] = [
  makeMessage({ id: "m01", conversationId: C_LUIS, driverId: D_LUIS, kind: "sms_in", body: "Rolling out of Chicago, ETA Joliet yard 14:30", createdAt: "2026-09-03T13:02:00.000Z" }),
  makeMessage({ id: "m02", conversationId: C_LUIS, driverId: D_LUIS, kind: "sms_out", body: "Copy. Door 3 is clear. Check call at the scale.", createdAt: "2026-09-03T13:04:00.000Z", sender: MAYA, twilioSid: "SM_demo_luis_1" }),
  makeMessage({ id: "m03", conversationId: C_LUIS, driverId: D_LUIS, kind: "internal_note", body: "Luis is covering the I-55 relay. Don't bounce him to the Hazmat board.", createdAt: "2026-09-03T13:06:00.000Z", sender: JORDAN }),
  makeMessage({ id: "m04", conversationId: C_LUIS, driverId: D_LUIS, kind: "sms_in", body: "Scale was green. 20 out.", createdAt: "2026-09-03T16:42:00.000Z" }),

  makeMessage({ id: "m05", conversationId: C_DANA, driverId: D_DANA, kind: "sms_out", body: "Hazmat placards on the tanker — confirm 3/3 before you roll.", createdAt: "2026-09-03T15:10:00.000Z", sender: PRIYA, twilioSid: "SM_demo_dana_1" }),
  makeMessage({ id: "m06", conversationId: C_DANA, driverId: D_DANA, kind: "sms_in", body: "All three on. Leaving the terminal now.", createdAt: "2026-09-03T15:18:00.000Z" }),
  makeMessage({ id: "m07", conversationId: C_DANA, driverId: D_DANA, kind: "internal_note", body: "Dana has the chlorine load. If she texts late, call her cell — she can't pull over on the turnpike.", createdAt: "2026-09-03T15:20:00.000Z", sender: MAYA }),

  makeMessage({ id: "m08", conversationId: C_MARCUS, driverId: D_MARCUS, kind: "sms_in", body: "Need a new BOL, the shipper signed the wrong one", createdAt: "2026-09-03T14:05:00.000Z" }),
  makeMessage({ id: "m09", conversationId: C_MARCUS, driverId: D_MARCUS, kind: "sms_out", body: "Sending a photo of the corrected BOL to this thread. Wait for it before you leave the dock.", createdAt: "2026-09-03T14:07:00.000Z", sender: MAYA, twilioSid: "SM_demo_marcus_1" }),
  makeMessage({ id: "m10", conversationId: C_MARCUS, driverId: D_MARCUS, kind: "internal_note", body: "Marcus will push back on detention. Log start time on the dock.", createdAt: "2026-09-03T14:08:00.000Z", sender: PRIYA }),

  makeMessage({ id: "m11", conversationId: C_KEISHA, driverId: D_KEISHA, kind: "sms_in", body: "Empty in Columbus. Want me to deadhead to Cincinnati or sit?", createdAt: "2026-09-03T13:32:00.000Z" }),
  makeMessage({ id: "m12", conversationId: C_KEISHA, driverId: D_KEISHA, kind: "sms_out", body: "Deadhead to CIN. Live load at 18:00, Pro# 88421.", createdAt: "2026-09-03T13:40:00.000Z", sender: JORDAN, twilioSid: "SM_demo_keisha_1" }),

  makeMessage({ id: "m13", conversationId: C_TOM, driverId: D_TOM, kind: "sms_in", body: "Truck 17 check engine light. Still running.", createdAt: "2026-09-03T12:11:00.000Z" }),
  makeMessage({ id: "m14", conversationId: C_TOM, driverId: D_TOM, kind: "internal_note", body: "Shop said they can take him at 7am. Don't book him tonight.", createdAt: "2026-09-03T12:14:00.000Z", sender: MAYA }),
];

export const DEMO_BROADCASTS: Broadcast[] = [];

export type DemoState = {
  staff: Profile[];
  tags: Tag[];
  drivers: Driver[];
  conversations: Conversation[];
  messages: Message[];
  broadcasts: Broadcast[];
};

export function cloneDemoState(): DemoState {
  return {
    staff: structuredClone(DEMO_STAFF_ROSTER),
    tags: structuredClone(DEMO_TAGS),
    drivers: structuredClone(DEMO_DRIVERS),
    conversations: structuredClone(DEMO_CONVERSATIONS),
    messages: structuredClone(DEMO_MESSAGES),
    broadcasts: structuredClone(DEMO_BROADCASTS),
  };
}

/** Seed used by the client demo hook. Messages are keyed by driver id. */
export function cloneDemoDesk(): { drivers: Driver[]; messages: Message[] } {
  const state = cloneDemoState();
  return { drivers: state.drivers, messages: state.messages };
}
