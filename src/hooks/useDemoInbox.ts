"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getInboxClient } from "@/lib/inbox";
import {
  canBroadcast,
  canEditContacts,
  canEditWorkflow,
  canManageGroups,
  canSend,
  canViewActivity,
} from "@/lib/permissions";
import type {
  ActivityEvent,
  AssignmentFilter,
  ContactGroup,
  ContactPatch,
  Conversation,
  DateFilter,
  Driver,
  InboxSnapshot,
  Message,
  PresenceEntry,
  Profile,
  ReadFilter,
  StatusFilter,
  Tag,
  WorkflowStatus,
} from "@/lib/types";

export type ComposerMode = "sms" | "note";

export type ThreadRow = {
  conversation: Conversation;
  driver: Driver;
  tags: Tag[];
  groups: ContactGroup[];
};

function messagesForThread(
  snap: InboxSnapshot,
  conversationId: string,
  driverId: string,
): Message[] {
  const byId = new Map<string, Message>();
  for (const list of Object.values(snap.messagesByConversation)) {
    for (const message of list) {
      if (
        message.conversationId === conversationId ||
        message.conversation_id === conversationId ||
        message.conversationId === driverId ||
        message.conversation_id === driverId ||
        message.driverId === driverId
      ) {
        byId.set(message.id, message);
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function buildRows(snap: InboxSnapshot): ThreadRow[] {
  const drivers = new Map(snap.drivers.map((driver) => [driver.id, driver]));
  return snap.conversations.flatMap((conversation) => {
    const driver = drivers.get(conversation.driverId);
    if (!driver) return [];
    const tags =
      driver.tags?.length > 0
        ? driver.tags
        : snap.tags.filter((tag) => driver.tagIds?.includes(tag.id));
    const groups =
      driver.groups?.length > 0
        ? driver.groups
        : snap.groups.filter((group) => driver.groupIds?.includes(group.id));
    return [{ conversation, driver, tags, groups }];
  });
}

function isSameDay(iso: string | null, now: number): boolean {
  if (!iso) return false;
  const then = new Date(iso);
  const current = new Date(now);
  return (
    then.getFullYear() === current.getFullYear() &&
    then.getMonth() === current.getMonth() &&
    then.getDate() === current.getDate()
  );
}

export function useDemoInbox(staff: Profile | null) {
  const client = useMemo(() => getInboxClient(), []);
  const [snap, setSnap] = useState<InboxSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("sms");
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const replyTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .getSnapshot()
      .then((next) => {
        if (cancelled) return;
        setSnap(next);
        setSelectedId((current) => current || next.conversations[0]?.id || "");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Inbox failed to load");
        setLoading(false);
      });
    const unsub = client.subscribe((next) => {
      setSnap(next);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [client]);

  useEffect(() => {
    void client.getSnapshot().then(setSnap).catch(() => undefined);
  }, [client, staff?.id]);

  const rows = useMemo(() => (snap ? buildRows(snap) : []), [snap]);
  const tags = snap?.tags ?? [];
  const groups = snap?.groups ?? [];
  const roster = snap?.staffRoster ?? [];
  const role = staff?.role ?? "dispatcher";

  const filtersActive =
    groupFilter.length > 0 ||
    tagFilter !== null ||
    assignmentFilter !== "all" ||
    readFilter !== "all" ||
    statusFilter !== "all" ||
    dateFilter !== "all" ||
    search.trim().length > 0;

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();
    return rows.filter((row) => {
      if (
        groupFilter.length > 0 &&
        !groupFilter.some(
          (id) => row.driver.groupIds?.includes(id) || row.groups.some((group) => group.id === id),
        )
      ) {
        return false;
      }
      if (
        tagFilter &&
        !row.driver.tagIds?.includes(tagFilter) &&
        !row.tags.some((tag) => tag.id === tagFilter)
      ) {
        return false;
      }
      if (assignmentFilter === "me" && row.conversation.assignedStaffId !== staff?.id) {
        return false;
      }
      if (assignmentFilter === "unassigned" && row.conversation.assignedStaffId) {
        return false;
      }
      if (
        assignmentFilter !== "all" &&
        assignmentFilter !== "me" &&
        assignmentFilter !== "unassigned" &&
        row.conversation.assignedStaffId !== assignmentFilter
      ) {
        return false;
      }
      if (readFilter === "unread" && row.conversation.unreadCount === 0) return false;
      if (readFilter === "read" && row.conversation.unreadCount > 0) return false;
      if (statusFilter !== "all" && row.conversation.status !== statusFilter) return false;
      if (dateFilter === "today" && !isSameDay(row.conversation.lastMessageAt, now)) return false;
      if (!query) return true;
      const preview = row.conversation.lastMessagePreview ?? "";
      return (
        row.driver.fullName.toLowerCase().includes(query) ||
        row.driver.phone.includes(query) ||
        row.driver.driverCode.toLowerCase().includes(query) ||
        row.driver.truck.toLowerCase().includes(query) ||
        preview.toLowerCase().includes(query) ||
        row.groups.some((group) => group.name.toLowerCase().includes(query)) ||
        row.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    });
  }, [
    rows,
    search,
    groupFilter,
    tagFilter,
    assignmentFilter,
    readFilter,
    statusFilter,
    dateFilter,
    staff?.id,
  ]);

  const unreadTotal = useMemo(
    () => rows.reduce((sum, row) => sum + row.conversation.unreadCount, 0),
    [rows],
  );

  const selectedRow = rows.find((row) => row.conversation.id === selectedId) ?? null;
  const thread: Message[] =
    snap && selectedRow
      ? messagesForThread(snap, selectedRow.conversation.id, selectedRow.driver.id)
      : [];

  const threadActivity: ActivityEvent[] = useMemo(() => {
    if (!snap || !selectedRow) return [];
    return snap.activityEvents.filter(
      (event) =>
        event.conversationId === selectedRow.conversation.id ||
        event.driverId === selectedRow.driver.id,
    );
  }, [snap, selectedRow]);

  const othersOnThread: PresenceEntry[] = useMemo(() => {
    if (!snap || !selectedRow || !staff) return [];
    return snap.presence.filter(
      (entry) =>
        entry.conversationId === selectedRow.conversation.id && entry.staffId !== staff.id,
    );
  }, [snap, selectedRow, staff]);

  const publishViewing = useCallback(
    (conversationId: string, mode: "viewing" | "replying") => {
      if (!staff || !conversationId) {
        client.publishPresence(null);
        return;
      }
      client.publishPresence({
        staffId: staff.id,
        staffName: staff.fullName,
        conversationId,
        mode,
      });
    },
    [client, staff],
  );

  useEffect(() => {
    if (!selectedId || !staff) return;
    publishViewing(selectedId, "viewing");
    return () => {
      client.publishPresence(null);
    };
  }, [selectedId, staff, client, publishViewing]);

  const selectConversation = useCallback(
    (id: string) => {
      setSelectedId(id);
      setComposerMode("sms");
      setError(null);
      void client.markRead(id).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not mark read");
      });
    },
    [client],
  );

  const sendFromComposer = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !selectedRow || !staff) return false;
      if (!canSend(staff.role)) {
        setError("Read-only accounts can view and filter, but cannot send.");
        return false;
      }
      setError(null);
      try {
        await client.sendMessage({
          conversationId: selectedRow.conversation.id,
          driverId: selectedRow.driver.id,
          body: trimmed,
          kind: composerMode === "note" ? "internal_note" : "sms_out",
          sender: staff,
        });
        publishViewing(selectedRow.conversation.id, "viewing");
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Send failed");
        return false;
      }
    },
    [client, composerMode, selectedRow, staff, publishViewing],
  );

  const sendBroadcast = useCallback(
    async (groupIds: string[], body: string, tagIds: string[] = []) => {
      const trimmed = body.trim();
      if (!trimmed || (groupIds.length === 0 && tagIds.length === 0) || !staff) return 0;
      setError(null);
      try {
        const broadcast = await client.sendBroadcast({
          body: trimmed,
          groupIds,
          tagIds,
          sender: staff,
        });
        return broadcast.recipientCount;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Broadcast failed");
        return 0;
      }
    },
    [client, staff],
  );

  const driversForGroups = useCallback(
    (groupIds: string[]) => {
      if (!snap || groupIds.length === 0) return [];
      return snap.drivers.filter((driver) => driver.groupIds?.some((id) => groupIds.includes(id)));
    },
    [snap],
  );

  const driversForTags = useCallback(
    (tagIds: string[]) => {
      if (!snap || tagIds.length === 0) return [];
      return snap.drivers.filter(
        (driver) =>
          driver.tagIds?.some((id) => tagIds.includes(id)) ||
          driver.tags?.some((tag) => tagIds.includes(tag.id)),
      );
    },
    [snap],
  );

  const assignTo = useCallback(
    async (staffId: string | null) => {
      if (!selectedRow || !staff) return;
      setError(null);
      try {
        await client.assignConversation(selectedRow.conversation.id, staffId, staff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not assign");
      }
    },
    [client, selectedRow, staff],
  );

  const setStatus = useCallback(
    async (status: WorkflowStatus) => {
      if (!selectedRow || !staff) return;
      setError(null);
      try {
        await client.setWorkflowStatus(selectedRow.conversation.id, status, staff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not update status");
      }
    },
    [client, selectedRow, staff],
  );

  const updateContact = useCallback(
    async (patch: ContactPatch) => {
      if (!selectedRow || !staff) return;
      setError(null);
      try {
        await client.updateContact(selectedRow.driver.id, patch, staff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not update contact");
      }
    },
    [client, selectedRow, staff],
  );

  const setContactGroups = useCallback(
    async (groupIds: string[]) => {
      if (!selectedRow || !staff) return;
      setError(null);
      try {
        await client.setContactGroups(selectedRow.driver.id, groupIds, staff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not update groups");
      }
    },
    [client, selectedRow, staff],
  );

  const createGroup = useCallback(
    async (name: string, color: string) => {
      if (!staff) return;
      setError(null);
      try {
        await client.createGroup(name, color, staff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not create group");
      }
    },
    [client, staff],
  );

  const renameGroup = useCallback(
    async (groupId: string, name: string) => {
      if (!staff) return;
      setError(null);
      try {
        await client.updateGroup(groupId, { name }, staff);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not update group");
      }
    },
    [client, staff],
  );

  const simulateInbound = useCallback(async () => {
    if (!selectedRow) return;
    setError(null);
    try {
      await client.simulateInbound(selectedRow.conversation.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not simulate inbound");
    }
  }, [client, selectedRow]);

  const resetDemo = useCallback(() => {
    client.resetDemo();
  }, [client]);

  const onComposerTyping = useCallback(() => {
    if (!selectedId || !staff) return;
    publishViewing(selectedId, "replying");
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      publishViewing(selectedId, "viewing");
    }, 1500);
  }, [publishViewing, selectedId, staff]);

  const toggleGroupFilter = useCallback((groupId: string) => {
    setGroupFilter((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setGroupFilter([]);
    setTagFilter(null);
    setAssignmentFilter("all");
    setReadFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
    setSearch("");
  }, []);

  return {
    loading,
    error,
    tags,
    groups,
    roster,
    selectedId,
    selectedRow,
    thread,
    threadActivity,
    othersOnThread,
    visibleRows,
    unreadTotal,
    composerMode,
    setComposerMode,
    search,
    setSearch,
    groupFilter,
    setGroupFilter,
    toggleGroupFilter,
    tagFilter,
    setTagFilter,
    assignmentFilter,
    setAssignmentFilter,
    readFilter,
    setReadFilter,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filtersActive,
    clearFilters,
    broadcastOpen,
    setBroadcastOpen,
    groupsOpen,
    setGroupsOpen,
    selectConversation,
    sendFromComposer,
    sendBroadcast,
    driversForGroups,
    driversForTags,
    assignTo,
    setStatus,
    updateContact,
    setContactGroups,
    createGroup,
    renameGroup,
    simulateInbound,
    resetDemo,
    onComposerTyping,
    canSend: staff ? canSend(staff.role) : false,
    canBroadcast: staff ? canBroadcast(staff.role) : false,
    canEditContacts: staff ? canEditContacts(staff.role) : false,
    canEditWorkflow: staff ? canEditWorkflow(staff.role) : false,
    canManageGroups: staff ? canManageGroups(staff.role) : false,
    canViewActivity: staff ? canViewActivity(role) : false,
  };
}
