"use client";

import { useRouter } from "next/navigation";
import { useDemoSession } from "@/hooks/useDemoSession";
import { DEMO_DISPATCHER } from "@/lib/demo-data";

type Props = {
  href?: string;
  className?: string;
  children: React.ReactNode;
};

export function TryDemoButton({
  href = "/dashboard",
  className,
  children,
}: Props) {
  const router = useRouter();
  const { enterAs } = useDemoSession();

  return (
    <button
      type="button"
      onClick={() => {
        enterAs(DEMO_DISPATCHER);
        router.push(href);
      }}
      className={className}
    >
      {children}
    </button>
  );
}
