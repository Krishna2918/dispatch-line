import type { Metadata } from "next";
import { DemoWalkthrough } from "@/components/marketing/DemoWalkthrough";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Demo",
};

export default function DemoPage() {
  return (
    <MarketingShell>
      <DemoWalkthrough />
    </MarketingShell>
  );
}
