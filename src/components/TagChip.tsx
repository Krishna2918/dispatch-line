import type { Tag } from "@/lib/types";

type TagChipProps = {
  tag: Tag;
  compact?: boolean;
  size?: "sm" | "md";
  active?: boolean;
  onClick?: () => void;
};

export function TagChip({ tag, compact = false, size, active = false, onClick }: TagChipProps) {
  const small = compact || size === "sm";
  const className = small
    ? "lift inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
    : "lift inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide";

  const style = {
    color: tag.color,
    backgroundColor: active ? `${tag.color}33` : `${tag.color}22`,
    borderColor: active ? tag.color : `${tag.color}80`,
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style} aria-pressed={active}>
        {tag.name}
      </button>
    );
  }

  return (
    <span className={className} style={style}>
      {tag.name}
    </span>
  );
}
