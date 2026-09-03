"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getInboxClient } from "@/lib/inbox";
import type {
  Conversation,
  Driver,
  InboxSnapshot,
  Message,
  Profile,
  Tag,
} from "@/lib/types";

export type ComposerMode = "sms" | "note";

export type ThreadRow = {
  conversation: Conversation;
  driver: Driver;
  tags: Tag[];
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
    if (!driver) {
      return [];
    }
    const tags =
      driver.tags?.length
        ? driver.tags
        : snap.tags.filter((tag) => driver.tagIds?.includes(tag.id));
    return [{ conversation, driver, tags }];
  });
}

export function useDemoInbox(staff: Profile | null) {
  const client = useMemo(() => getInboxClient(), []);
  const [snap, setSnap] = useState<InboxSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("sms");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client
      .getSnapshot()
      .then((next) => {
        if (cancelled) {
          return;
        }
        setSnap(next);
        setSelectedId((current) => current || next.conversations[0]?.id || "");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
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

  const rows = useMemo(() => (snap ? buildRows(snap) : []), [snap]);
  const tags = snap?.tags ?? [];

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        tagFilter &&
        !row.driver.tagIds?.includes(tagFilter) &&
        !row.tags.some((tag) => tag.id === tagFilter)
      ) {
        return false;
      }
      if (!query) {
        return true;
      }
      const preview = row.conversation.lastMessagePreview ?? "";
      return (
        row.driver.fullName.toLowerCase().includes(query) ||
        row.driver.phone.includes(query) ||
        preview.toLowerCase().includes(query) ||
        row.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    });
  }, [rows, search, tagFilter]);

  const unreadTotal = useMemo(
    () => rows.reduce((sum, row) => sum + row.conversation.unreadCount, 0),
    [rows],
  );

  const selectedRow = rows.find((row) => row.conversation.id === selectedId) ?? null;
  const thread: Message[] =
    snap && selectedRow
      ? messagesForThread(snap, selectedRow.conversation.id, selectedRow.driver.id)
      : [];

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
      if (!trimmed || !selectedRow) {
        return false;
      }
      setError(null);
      try {
        await client.sendMessage({
          conversationId: selectedRow.conversation.id,
          driverId: selectedRow.driver.id,
          body: trimmed,
          kind: composerMode === "note" ? "internal_note" : "sms_out",
          sender: staff ?? {
            id: "anonymous",
            name: "Dispatcher",
            fullName: "Dispatcher",
            role: "dispatcher",
          },
        });
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Send failed");
        return false;
      }
    },
    [client, composerMode, selectedRow, staff],
  );

  const sendBroadcast = useCallback(
    async (tagIds: string[], body: string) => {
      const trimmed = body.trim();
      if (!trimmed || tagIds.length === 0) {
        return 0;
      }
      setError(null);
      try {
        const broadcast = await client.sendBroadcast({
          body: trimmed,
          tagIds,
          sender: staff ?? {
            id: "anonymous",
            name: "Dispatcher",
            fullName: "Dispatcher",
            role: "dispatcher",
          },
        });
        return broadcast.recipientCount;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Broadcast failed");
        return 0;
      }
    },
    [client, staff],
  );

  const driversForTags = useCallback(
    (tagIds: string[]) => {
      if (!snap || tagIds.length === 0) {
        return [];
      }
      return snap.drivers.filter(
        (driver) =>
          driver.tagIds?.some((id) => tagIds.includes(id)) ||
          driver.tags?.some((tag) => tagIds.includes(tag.id)),
      );
    },
    [snap],
  );

  return {
    loading,
    error,
    tags,
    selectedId,
    selectedRow,
    thread,
    visibleRows,
    unreadTotal,
    composerMode,
    setComposerMode,
    search,
    setSearch,
    tagFilter,
    setTagFilter,
    broadcastOpen,
    setBroadcastOpen,
    selectConversation,
    sendFromComposer,
    sendBroadcast,
    driversForTags,
  };
}
