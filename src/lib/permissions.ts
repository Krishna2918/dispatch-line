import type { Profile, StaffRole } from "./types";

export function canSend(role: StaffRole): boolean {
  return role !== "readonly";
}

export function canEditContacts(role: StaffRole): boolean {
  return role === "admin" || role === "dispatcher" || role === "manager";
}

export function canEditWorkflow(role: StaffRole): boolean {
  return role === "admin" || role === "dispatcher" || role === "manager";
}

export function canManageGroups(role: StaffRole): boolean {
  return role === "admin";
}

export function canViewActivity(role: StaffRole): boolean {
  return role === "admin" || role === "manager";
}

export function canBroadcast(role: StaffRole): boolean {
  return role !== "readonly";
}

export function assertCanSend(actor: Profile) {
  if (!canSend(actor.role)) {
    throw new Error("Read-only accounts can view and filter, but cannot send or post notes.");
  }
}

export function assertCanEditContacts(actor: Profile) {
  if (!canEditContacts(actor.role)) {
    throw new Error("This account cannot edit contacts.");
  }
}

export function assertCanEditWorkflow(actor: Profile) {
  if (!canEditWorkflow(actor.role)) {
    throw new Error("This account cannot change assignment or status.");
  }
}

export function assertCanManageGroups(actor: Profile) {
  if (!canManageGroups(actor.role)) {
    throw new Error("Only administrators can create or edit groups.");
  }
}
