import type { Metadata } from "next";
import { SharedInbox } from "@/components/SharedInbox";

export const metadata: Metadata = {
  title: "Inbox",
};

export default function InboxPage() {
  return <SharedInbox />;
}
