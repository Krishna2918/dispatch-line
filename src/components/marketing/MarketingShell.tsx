import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-board">
      <MarketingNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <MarketingFooter />
    </div>
  );
}
