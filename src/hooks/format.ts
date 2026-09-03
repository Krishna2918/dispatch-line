export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function formatRelativeTime(iso: string | null, now = Date.now()): string {
  if (!iso) {
    return "";
  }
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const deltaSec = Math.max(0, Math.round((now - then) / 1000));
  if (deltaSec < 45) {
    return "now";
  }
  const deltaMin = Math.round(deltaSec / 60);
  if (deltaMin < 60) {
    return `${deltaMin}m`;
  }
  const deltaHr = Math.round(deltaMin / 60);
  if (deltaHr < 24) {
    return `${deltaHr}h`;
  }
  const deltaDay = Math.round(deltaHr / 24);
  return `${deltaDay}d`;
}

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function roleLabel(role: string): string {
  if (role === "admin") return "Administrator";
  if (role === "dispatcher") return "Dispatcher";
  if (role === "manager") return "Operations Manager";
  if (role === "readonly") return "Read-only · Safety";
  return role;
}

export function statusLabel(status: string): string {
  if (status === "new") return "New";
  if (status === "open") return "Open";
  if (status === "in_progress") return "In Progress";
  if (status === "waiting_for_driver") return "Waiting for Driver";
  if (status === "resolved") return "Resolved";
  return status;
}
