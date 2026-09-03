"use client";

import { useState } from "react";
import { formatClock } from "@/hooks/format";
import { useBoardClock } from "@/hooks/useBoardClock";
import { useDemoInbox } from "@/hooks/useDemoInbox";
import { useDemoSession } from "@/hooks/useDemoSession";
import { DEMO_DISPATCHER } from "@/lib/demo-data";
import { BroadcastModal } from "./BroadcastModal";
import { ChatFeed } from "./ChatFeed";
import { Composer } from "./Composer";
import { ContactProfile } from "./ContactProfile";
import { ConversationList } from "./ConversationList";
import { DispatcherSwitcher } from "./DispatcherSwitcher";
import { GroupManager } from "./GroupManager";
import { IconBroadcast } from "./icons";

export function SharedInbox() {
  const { staff, setStaff } = useDemoSession();
  const activeStaff = staff ?? DEMO_DISPATCHER;
  const inbox = useDemoInbox(activeStaff);
  const now = useBoardClock(1000);
  const [mobilePane, setMobilePane] = useState<"list" | "chat">("list");

  return (
    <div className="flex h-dvh flex-col gap-2 overflow-hidden bg-board p-2 text-ink md:p-3">
      <a
        href="#thread-search"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-20 focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-board"
      >
        Skip to threads
      </a>

      <header className="flex h-14 shrink-0 items-center gap-2 rounded-full border border-line bg-panel/90 px-3 sm:gap-3 sm:px-4">
        <span className="size-2 shrink-0 rounded-full bg-amber" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber">
            DispatchLine
          </p>
          <p className="truncate text-[13px] text-ink">One shared SMS desk</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-board/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted lg:flex">
          <span className="relative flex items-center gap-1.5 text-ok">
            <span className="size-1.5 rounded-full bg-ok motion-safe:animate-pulse" aria-hidden />
            Live
          </span>
          <span aria-hidden>·</span>
          <span>Demo</span>
          <span aria-hidden>·</span>
          <time dateTime={new Date(now).toISOString()}>{formatClock(new Date(now))}</time>
        </div>
        <button
          type="button"
          onClick={inbox.resetDemo}
          className="lift hidden rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink md:inline-flex"
        >
          Reset desk
        </button>
        <DispatcherSwitcher
          staff={activeStaff}
          roster={inbox.roster.length > 0 ? inbox.roster : [activeStaff]}
          onSelect={setStaff}
        />
        {inbox.canManageGroups ? (
          <button
            type="button"
            onClick={() => inbox.setGroupsOpen(true)}
            className="lift hidden rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-ink lg:inline-flex"
          >
            Groups
          </button>
        ) : null}
        {inbox.canBroadcast ? (
          <button
            type="button"
            onClick={() => inbox.setBroadcastOpen(true)}
            className="lift hidden items-center gap-1.5 rounded-full border border-amber/50 bg-amber/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-amber hover:bg-amber/20 sm:inline-flex"
          >
            <IconBroadcast className="size-3.5" />
            Mass broadcast
          </button>
        ) : null}
      </header>

      {inbox.loading ? (
        <div className="flex flex-1 items-center justify-center rounded-[2.5rem] border border-line bg-panel font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
          Loading desk…
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-2">
          <div
            className={`h-full min-h-0 w-full overflow-hidden rounded-[2.5rem] border border-line md:block md:w-auto ${
              mobilePane === "list" ? "block" : "hidden"
            }`}
          >
            <ConversationList
              rows={inbox.visibleRows}
              tags={inbox.tags}
              groups={inbox.groups}
              roster={inbox.roster}
              staff={activeStaff}
              selectedId={inbox.selectedId}
              search={inbox.search}
              groupFilter={inbox.groupFilter}
              tagFilter={inbox.tagFilter}
              assignmentFilter={inbox.assignmentFilter}
              readFilter={inbox.readFilter}
              statusFilter={inbox.statusFilter}
              dateFilter={inbox.dateFilter}
              filtersActive={inbox.filtersActive}
              unreadTotal={inbox.unreadTotal}
              now={now}
              onSearchChange={inbox.setSearch}
              onToggleGroup={inbox.toggleGroupFilter}
              onTagFilterChange={inbox.setTagFilter}
              onAssignmentChange={inbox.setAssignmentFilter}
              onReadChange={inbox.setReadFilter}
              onStatusChange={inbox.setStatusFilter}
              onDateChange={inbox.setDateFilter}
              onClearFilters={inbox.clearFilters}
              onClearGroups={() => inbox.setGroupFilter([])}
              onSelect={(id) => {
                inbox.selectConversation(id);
                setMobilePane("chat");
              }}
            />
          </div>

          <div
            className={`min-h-0 min-w-0 flex-1 overflow-hidden rounded-[2.5rem] border border-line bg-panel ${
              mobilePane === "chat" ? "flex flex-col" : "hidden md:flex md:flex-col"
            }`}
          >
            <ChatFeed
              driver={inbox.selectedRow?.driver ?? null}
              messages={inbox.thread}
              roster={inbox.roster}
              assignedStaffId={inbox.selectedRow?.conversation.assignedStaffId ?? null}
              status={inbox.selectedRow?.conversation.status ?? null}
              others={inbox.othersOnThread}
              canBroadcast={inbox.canBroadcast}
              canEditWorkflow={inbox.canEditWorkflow}
              onBack={() => setMobilePane("list")}
              onBroadcast={() => inbox.setBroadcastOpen(true)}
              onAssign={inbox.assignTo}
              onStatus={inbox.setStatus}
              onSimulateInbound={inbox.simulateInbound}
            />
            <Composer
              mode={inbox.composerMode}
              driverName={inbox.selectedRow?.driver.fullName ?? null}
              staffName={activeStaff.fullName}
              staff={activeStaff}
              error={inbox.error}
              canSend={inbox.canSend}
              onTyping={inbox.onComposerTyping}
              onModeChange={inbox.setComposerMode}
              onSend={inbox.sendFromComposer}
            />
          </div>

          {inbox.selectedRow ? (
            <div className="hidden overflow-hidden rounded-[2.5rem] border border-line xl:block">
              <ContactProfile
                driver={inbox.selectedRow.driver}
                groups={inbox.groups}
                roster={inbox.roster}
                assignedStaffId={inbox.selectedRow.conversation.assignedStaffId}
                status={inbox.selectedRow.conversation.status}
                canEdit={inbox.canEditContacts}
                canViewActivity={inbox.canViewActivity}
                activity={inbox.threadActivity}
                onUpdate={inbox.updateContact}
                onGroupsChange={inbox.setContactGroups}
              />
            </div>
          ) : null}
        </div>
      )}

      <BroadcastModal
        open={inbox.broadcastOpen}
        groups={inbox.groups}
        tags={inbox.tags}
        staffName={activeStaff.fullName}
        driversForGroups={inbox.driversForGroups}
        driversForTags={inbox.driversForTags}
        onClose={() => inbox.setBroadcastOpen(false)}
        onSend={(groupIds, body, tagIds) => inbox.sendBroadcast(groupIds, body, tagIds)}
      />
      <GroupManager
        open={inbox.groupsOpen}
        groups={inbox.groups}
        onClose={() => inbox.setGroupsOpen(false)}
        onCreate={inbox.createGroup}
        onRename={inbox.renameGroup}
      />
    </div>
  );
}
