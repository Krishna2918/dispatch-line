import type { Metadata } from "next";
import { DashboardHome } from "@/components/marketing/DashboardHome";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <MarketingShell>
      <DashboardHome />
    </MarketingShell>
  );
}
