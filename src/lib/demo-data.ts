import {
  asProfile,
  type ActivityEvent,
  type Broadcast,
  type ContactGroup,
  type Conversation,
  type Driver,
  type Message,
  type Profile,
  type Tag,
  type WorkflowStatus,
} from "./types";

export const DEMO_STATE_VERSION = 3;

export const STAFF_SARAH = "11111111-1111-1111-1111-111111111111";
export const STAFF_DAVID = "22222222-2222-2222-2222-222222222222";
export const STAFF_ALEX = "33333333-3333-3333-3333-333333333333";
export const STAFF_PRIYA = "44444444-4444-4444-4444-444444444444";
export const STAFF_MORGAN = "55555555-5555-5555-5555-555555555555";

export const DEMO_STAFF_ROSTER: Profile[] = [
  asProfile({ id: STAFF_SARAH, name: "Sarah Chen", role: "dispatcher" }),
  asProfile({ id: STAFF_DAVID, name: "David Singh", role: "dispatcher" }),
  asProfile({ id: STAFF_ALEX, name: "Alex Rivera", role: "manager" }),
  asProfile({ id: STAFF_PRIYA, name: "Priya Shah", role: "admin" }),
  asProfile({ id: STAFF_MORGAN, name: "Morgan Lee", role: "readonly" }),
];

export const DEMO_STAFF: Profile[] = DEMO_STAFF_ROSTER;
export const DEMO_DISPATCHER: Profile = DEMO_STAFF_ROSTER[0];

export const SARAH = DEMO_STAFF_ROSTER[0];
export const DAVID_STAFF = DEMO_STAFF_ROSTER[1];
export const ALEX = DEMO_STAFF_ROSTER[2];
export const PRIYA = DEMO_STAFF_ROSTER[3];
export const MORGAN = DEMO_STAFF_ROSTER[4];

export const GROUP_MONTREAL: ContactGroup = {
  id: "77777777-7777-7777-7777-777777777771",
  name: "Montreal Drivers",
  color: "#3d7ea6",
};
export const GROUP_TORONTO: ContactGroup = {
  id: "77777777-7777-7777-7777-777777777772",
  name: "Toronto Drivers",
  color: "#c45c26",
};
export const GROUP_LOCAL: ContactGroup = {
  id: "77777777-7777-7777-7777-777777777773",
  name: "Local Drivers",
  color: "#7cb87a",
};
export const GROUP_HIGHWAY: ContactGroup = {
  id: "77777777-7777-7777-7777-777777777774",
  name: "Highway Drivers",
  color: "#e0703a",
};
export const GROUP_OWNER_OPS: ContactGroup = {
  id: "77777777-7777-7777-7777-777777777775",
  name: "Owner Operators",
  color: "#c9a227",
};
export const GROUP_COMPANY: ContactGroup = {
  id: "77777777-7777-7777-7777-777777777776",
  name: "Company Drivers",
  color: "#8eb6d4",
};

export const DEMO_GROUPS: ContactGroup[] = [
  GROUP_MONTREAL,
  GROUP_TORONTO,
  GROUP_LOCAL,
  GROUP_HIGHWAY,
  GROUP_OWNER_OPS,
  GROUP_COMPANY,
];

export const TAG_HAZMAT: Tag = {
  id: "88888888-8888-8888-8888-888888888881",
  name: "Hazmat",
  color: "#c45c26",
};

export const DEMO_TAGS: Tag[] = [TAG_HAZMAT];

export const D_JOHN = "55555555-5555-5555-5555-555555555551";
export const D_ROBERT = "55555555-5555-5555-5555-555555555552";
export const D_MIKE = "55555555-5555-5555-5555-555555555553";
export const D_JAMES = "55555555-5555-5555-5555-555555555554";
export const D_KAPOOR = "55555555-5555-5555-5555-555555555555";
export const D_MARIE = "55555555-5555-5555-5555-555555555556";
export const D_AISHA = "55555555-5555-5555-5555-555555555557";
export const D_CARLOS = "55555555-5555-5555-5555-555555555558";
export const D_ELENA = "55555555-5555-5555-5555-555555555559";
export const D_SAM = "55555555-5555-5555-5555-55555555555a";

export const C_JOHN = "66666666-6666-6666-6666-666666666661";
export const C_ROBERT = "66666666-6666-6666-6666-666666666662";
export const C_MIKE = "66666666-6666-6666-6666-666666666663";
export const C_JAMES = "66666666-6666-6666-6666-666666666664";
export const C_KAPOOR = "66666666-6666-6666-6666-666666666665";
export const C_MARIE = "66666666-6666-6666-6666-666666666666";
export const C_AISHA = "66666666-6666-6666-6666-666666666667";
export const C_CARLOS = "66666666-6666-6666-6666-666666666668";
export const C_ELENA = "66666666-6666-6666-6666-666666666669";
export const C_SAM = "66666666-6666-6666-6666-66666666666a";

export const JOHN_INBOUND_BODY = "Truck 125 is at the customer. Waiting on a dock.";

function driver(partial: {
  id: string;
  fullName: string;
  phone: string;
  notes?: string;
  driverCode: string;
  truck: string;
  terminal: string;
  groups: ContactGroup[];
  tags?: Tag[];
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
}): Driver {
  const tags = partial.tags ?? [];
  return {
    id: partial.id,
    fullName: partial.fullName,
    full_name: partial.fullName,
    phone: partial.phone,
    notes: partial.notes,
    driverCode: partial.driverCode,
    truck: partial.truck,
    terminal: partial.terminal,
    tags,
    tagIds: tags.map((tag) => tag.id),
    groups: partial.groups,
    groupIds: partial.groups.map((group) => group.id),
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
    id: D_JOHN,
    fullName: "John Smith",
    phone: "+15145550125",
    notes: "Owner-op on the Montreal lane. Truck 125. Prefers text over voice.",
    driverCode: "DR-125",
    truck: "125",
    terminal: "Montreal",
    groups: [GROUP_MONTREAL, GROUP_OWNER_OPS],
    lastMessageAt: "2026-09-03T18:18:00.000Z",
    lastMessagePreview: JOHN_INBOUND_BODY,
    unreadCount: 1,
  }),
  driver({
    id: D_ROBERT,
    fullName: "Robert Lee",
    phone: "+15145550126",
    notes: "Company driver, Montreal city + South Shore.",
    driverCode: "DR-214",
    truck: "214",
    terminal: "Montreal",
    groups: [GROUP_MONTREAL, GROUP_COMPANY],
    lastMessageAt: "2026-09-03T17:40:00.000Z",
    lastMessagePreview: "Empty at the yard. Ready for the 19:00 live load.",
    unreadCount: 0,
  }),
  driver({
    id: D_MIKE,
    fullName: "Mike Brown",
    phone: "+14165550130",
    notes: "Highway owner-op. Watch HOS on the 401.",
    driverCode: "DR-088",
    truck: "88",
    terminal: "Mississauga",
    groups: [GROUP_HIGHWAY, GROUP_OWNER_OPS],
    tags: [TAG_HAZMAT],
    lastMessageAt: "2026-09-03T16:55:00.000Z",
    lastMessagePreview: "Scale was green. Rolling toward Kingston.",
    unreadCount: 1,
  }),
  driver({
    id: D_JAMES,
    fullName: "James Patel",
    phone: "+14165550131",
    notes: "Toronto local. GTA cartage and airport runs.",
    driverCode: "DR-441",
    truck: "441",
    terminal: "Toronto",
    groups: [GROUP_TORONTO, GROUP_LOCAL],
    lastMessageAt: "2026-09-03T16:12:00.000Z",
    lastMessagePreview: "At Pearson cargo. Door 12 is backed in.",
    unreadCount: 0,
  }),
  driver({
    id: D_KAPOOR,
    fullName: "David Kapoor",
    phone: "+14165550132",
    notes: "Toronto company driver. Not staff — do not confuse with David Singh on the desk.",
    driverCode: "DR-307",
    truck: "307",
    terminal: "Toronto",
    groups: [GROUP_TORONTO, GROUP_COMPANY],
    lastMessageAt: "2026-09-03T15:48:00.000Z",
    lastMessagePreview: "Need a new BOL photo — shipper signed the wrong one.",
    unreadCount: 1,
  }),
  driver({
    id: D_MARIE,
    fullName: "Marie Gagnon",
    phone: "+15145550133",
    notes: "Montreal local / shop overflow.",
    driverCode: "DR-119",
    truck: "119",
    terminal: "Montreal",
    groups: [GROUP_MONTREAL, GROUP_LOCAL],
    lastMessageAt: "2026-09-03T15:10:00.000Z",
    lastMessagePreview: "Truck 119 check engine light. Still running.",
    unreadCount: 0,
  }),
  driver({
    id: D_AISHA,
    fullName: "Aisha Khan",
    phone: "+14165550134",
    notes: "Toronto company. Evening hook-and-drop.",
    driverCode: "DR-552",
    truck: "552",
    terminal: "Toronto",
    groups: [GROUP_TORONTO, GROUP_COMPANY],
    lastMessageAt: "2026-09-03T14:22:00.000Z",
    lastMessagePreview: "Hooked 552. Rolling to Brampton drop.",
    unreadCount: 0,
  }),
  driver({
    id: D_CARLOS,
    fullName: "Carlos Mendez",
    phone: "+19055550135",
    notes: "Highway company. Detroit–Windsor lane.",
    driverCode: "DR-076",
    truck: "76",
    terminal: "Windsor",
    groups: [GROUP_HIGHWAY, GROUP_COMPANY],
    tags: [TAG_HAZMAT],
    lastMessageAt: "2026-09-03T13:50:00.000Z",
    lastMessagePreview: "Cleared the bridge. ETA London 16:30.",
    unreadCount: 0,
  }),
  driver({
    id: D_ELENA,
    fullName: "Elena Rossi",
    phone: "+15145550136",
    notes: "Local company. West Island + Dorval.",
    driverCode: "DR-203",
    truck: "203",
    terminal: "Montreal",
    groups: [GROUP_LOCAL, GROUP_COMPANY],
    lastMessageAt: "2026-09-03T13:05:00.000Z",
    lastMessagePreview: "Delivered Dorval. Heading back to the terminal.",
    unreadCount: 0,
  }),
  driver({
    id: D_SAM,
    fullName: "Sam Okonkwo",
    phone: "+14165550137",
    notes: "Highway owner-op. Prefers night dispatch.",
    driverCode: "DR-064",
    truck: "64",
    terminal: "Toronto",
    groups: [GROUP_HIGHWAY, GROUP_OWNER_OPS],
    lastMessageAt: "2026-09-03T12:30:00.000Z",
    lastMessagePreview: "Parked at the Petro. Ready after 21:00 reset.",
    unreadCount: 0,
  }),
];

function conversation(partial: {
  id: string;
  driverId: string;
  unreadCount: number;
  assignedStaffId?: string | null;
  status?: WorkflowStatus;
  readAt?: string | null;
}): Conversation {
  const driver = DEMO_DRIVERS.find((row) => row.id === partial.driverId)!;
  return {
    id: partial.id,
    driverId: partial.driverId,
    lastMessageAt: driver.lastMessageAt,
    lastMessagePreview: driver.lastMessagePreview,
    unreadCount: partial.unreadCount,
    readAt: partial.readAt ?? (partial.unreadCount > 0 ? null : driver.lastMessageAt),
    assignedStaffId: partial.assignedStaffId ?? null,
    status: partial.status ?? "open",
  };
}

export const DEMO_CONVERSATIONS: Conversation[] = [
  conversation({ id: C_JOHN, driverId: D_JOHN, unreadCount: 1, status: "open" }),
  conversation({
    id: C_ROBERT,
    driverId: D_ROBERT,
    unreadCount: 0,
    assignedStaffId: STAFF_SARAH,
    status: "in_progress",
  }),
  conversation({ id: C_MIKE, driverId: D_MIKE, unreadCount: 1, status: "new" }),
  conversation({
    id: C_JAMES,
    driverId: D_JAMES,
    unreadCount: 0,
    assignedStaffId: STAFF_DAVID,
    status: "waiting_for_driver",
  }),
  conversation({ id: C_KAPOOR, driverId: D_KAPOOR, unreadCount: 1, status: "open" }),
  conversation({
    id: C_MARIE,
    driverId: D_MARIE,
    unreadCount: 0,
    assignedStaffId: STAFF_SARAH,
    status: "resolved",
  }),
  conversation({ id: C_AISHA, driverId: D_AISHA, unreadCount: 0, status: "open" }),
  conversation({
    id: C_CARLOS,
    driverId: D_CARLOS,
    unreadCount: 0,
    assignedStaffId: STAFF_ALEX,
    status: "in_progress",
  }),
  conversation({ id: C_ELENA, driverId: D_ELENA, unreadCount: 0, status: "resolved" }),
  conversation({ id: C_SAM, driverId: D_SAM, unreadCount: 0, status: "open" }),
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
  makeMessage({
    id: "m-john-1",
    conversationId: C_JOHN,
    driverId: D_JOHN,
    kind: "sms_in",
    body: "On site. Looking for receiving.",
    createdAt: "2026-09-03T18:10:00.000Z",
  }),
  makeMessage({
    id: "m-john-2",
    conversationId: C_JOHN,
    driverId: D_JOHN,
    kind: "sms_out",
    body: "Copy John. Ask for dock 4 and text when you're spotted.",
    createdAt: "2026-09-03T18:12:00.000Z",
    sender: SARAH,
    twilioSid: "SM_demo_john_1",
  }),
  makeMessage({
    id: "m-john-3",
    conversationId: C_JOHN,
    driverId: D_JOHN,
    kind: "internal_note",
    body: "Customer is slow on docks after 14:00. Don't bounce Truck 125 yet.",
    createdAt: "2026-09-03T18:13:00.000Z",
    sender: ALEX,
  }),
  makeMessage({
    id: "m-john-4",
    conversationId: C_JOHN,
    driverId: D_JOHN,
    kind: "sms_in",
    body: JOHN_INBOUND_BODY,
    createdAt: "2026-09-03T18:18:00.000Z",
  }),

  makeMessage({
    id: "m-rob-1",
    conversationId: C_ROBERT,
    driverId: D_ROBERT,
    kind: "sms_in",
    body: "Empty at the yard. Ready for the 19:00 live load.",
    createdAt: "2026-09-03T17:36:00.000Z",
  }),
  makeMessage({
    id: "m-rob-2",
    conversationId: C_ROBERT,
    driverId: D_ROBERT,
    kind: "sms_out",
    body: "Stay put. Pro# 99210, door 3. I'll text if they slide it.",
    createdAt: "2026-09-03T17:40:00.000Z",
    sender: SARAH,
    twilioSid: "SM_demo_robert_1",
  }),

  makeMessage({
    id: "m-mike-1",
    conversationId: C_MIKE,
    driverId: D_MIKE,
    kind: "sms_out",
    body: "Hazmat placards on — confirm 3/3 before you roll.",
    createdAt: "2026-09-03T16:40:00.000Z",
    sender: PRIYA,
    twilioSid: "SM_demo_mike_1",
  }),
  makeMessage({
    id: "m-mike-2",
    conversationId: C_MIKE,
    driverId: D_MIKE,
    kind: "sms_in",
    body: "Scale was green. Rolling toward Kingston.",
    createdAt: "2026-09-03T16:55:00.000Z",
  }),

  makeMessage({
    id: "m-james-1",
    conversationId: C_JAMES,
    driverId: D_JAMES,
    kind: "sms_in",
    body: "At Pearson cargo. Door 12 is backed in.",
    createdAt: "2026-09-03T16:05:00.000Z",
  }),
  makeMessage({
    id: "m-james-2",
    conversationId: C_JAMES,
    driverId: D_JAMES,
    kind: "sms_out",
    body: "Copy. Text when you're empty — I have a Brampton live at 18:30.",
    createdAt: "2026-09-03T16:12:00.000Z",
    sender: DAVID_STAFF,
    twilioSid: "SM_demo_james_1",
  }),

  makeMessage({
    id: "m-kapoor-1",
    conversationId: C_KAPOOR,
    driverId: D_KAPOOR,
    kind: "sms_in",
    body: "Need a new BOL photo — shipper signed the wrong one.",
    createdAt: "2026-09-03T15:48:00.000Z",
  }),
  makeMessage({
    id: "m-kapoor-2",
    conversationId: C_KAPOOR,
    driverId: D_KAPOOR,
    kind: "internal_note",
    body: "This is David Kapoor the driver, not David Singh on the desk.",
    createdAt: "2026-09-03T15:49:00.000Z",
    sender: ALEX,
  }),

  makeMessage({
    id: "m-marie-1",
    conversationId: C_MARIE,
    driverId: D_MARIE,
    kind: "sms_in",
    body: "Truck 119 check engine light. Still running.",
    createdAt: "2026-09-03T15:02:00.000Z",
  }),
  makeMessage({
    id: "m-marie-2",
    conversationId: C_MARIE,
    driverId: D_MARIE,
    kind: "internal_note",
    body: "Shop can take her at 07:00. Don't book tonight.",
    createdAt: "2026-09-03T15:10:00.000Z",
    sender: SARAH,
  }),

  makeMessage({
    id: "m-aisha-1",
    conversationId: C_AISHA,
    driverId: D_AISHA,
    kind: "sms_in",
    body: "Hooked 552. Rolling to Brampton drop.",
    createdAt: "2026-09-03T14:22:00.000Z",
  }),

  makeMessage({
    id: "m-carlos-1",
    conversationId: C_CARLOS,
    driverId: D_CARLOS,
    kind: "sms_in",
    body: "Cleared the bridge. ETA London 16:30.",
    createdAt: "2026-09-03T13:44:00.000Z",
  }),
  makeMessage({
    id: "m-carlos-2",
    conversationId: C_CARLOS,
    driverId: D_CARLOS,
    kind: "sms_out",
    body: "Copy. Receiver is dock 6. Text yard time if they hold you.",
    createdAt: "2026-09-03T13:50:00.000Z",
    sender: ALEX,
    twilioSid: "SM_demo_carlos_1",
  }),

  makeMessage({
    id: "m-elena-1",
    conversationId: C_ELENA,
    driverId: D_ELENA,
    kind: "sms_in",
    body: "Delivered Dorval. Heading back to the terminal.",
    createdAt: "2026-09-03T13:05:00.000Z",
  }),

  makeMessage({
    id: "m-sam-1",
    conversationId: C_SAM,
    driverId: D_SAM,
    kind: "sms_in",
    body: "Parked at the Petro. Ready after 21:00 reset.",
    createdAt: "2026-09-03T12:30:00.000Z",
  }),
];

export const DEMO_BROADCASTS: Broadcast[] = [];

export const DEMO_ACTIVITY: ActivityEvent[] = [
  {
    id: "a-01",
    conversationId: C_ROBERT,
    driverId: D_ROBERT,
    staffId: STAFF_SARAH,
    staffName: "Sarah Chen",
    kind: "assigned",
    detail: "Assigned to Sarah Chen",
    createdAt: "2026-09-03T17:38:00.000Z",
  },
  {
    id: "a-02",
    conversationId: C_ROBERT,
    driverId: D_ROBERT,
    staffId: STAFF_SARAH,
    staffName: "Sarah Chen",
    kind: "status_changed",
    detail: "Status → In Progress",
    createdAt: "2026-09-03T17:39:00.000Z",
  },
  {
    id: "a-03",
    conversationId: C_JAMES,
    driverId: D_JAMES,
    staffId: STAFF_DAVID,
    staffName: "David Singh",
    kind: "assigned",
    detail: "Assigned to David Singh",
    createdAt: "2026-09-03T16:08:00.000Z",
  },
];

export type DemoState = {
  version: number;
  staff: Profile[];
  tags: Tag[];
  groups: ContactGroup[];
  drivers: Driver[];
  conversations: Conversation[];
  messages: Message[];
  broadcasts: Broadcast[];
  activityEvents: ActivityEvent[];
};

export function cloneDemoState(): DemoState {
  return {
    version: DEMO_STATE_VERSION,
    staff: structuredClone(DEMO_STAFF_ROSTER),
    tags: structuredClone(DEMO_TAGS),
    groups: structuredClone(DEMO_GROUPS),
    drivers: structuredClone(DEMO_DRIVERS),
    conversations: structuredClone(DEMO_CONVERSATIONS),
    messages: structuredClone(DEMO_MESSAGES),
    broadcasts: structuredClone(DEMO_BROADCASTS),
    activityEvents: structuredClone(DEMO_ACTIVITY),
  };
}

export function cloneDemoDesk(): { drivers: Driver[]; messages: Message[] } {
  const state = cloneDemoState();
  return { drivers: state.drivers, messages: state.messages };
}

export function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const parsed = value as DemoState;
  return (
    parsed.version === DEMO_STATE_VERSION &&
    Array.isArray(parsed.groups) &&
    Array.isArray(parsed.drivers) &&
    Array.isArray(parsed.conversations) &&
    Array.isArray(parsed.messages) &&
    Array.isArray(parsed.activityEvents) &&
    parsed.drivers.some((row) => row.id === D_JOHN && Array.isArray(row.groupIds))
  );
}
