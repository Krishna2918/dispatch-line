import { formatStamp } from "@/hooks/format";
import type { Message } from "@/lib/types";

type MessageBubbleProps = {
  message: Message;
  driverName: string;
  index?: number;
};

function staffSenderName(message: Message): string {
  return message.senderName || message.sender_name || "Dispatcher";
}

export function MessageBubble({ message, driverName, index = 0 }: MessageBubbleProps) {
  const inboundName = driverName;
  const outboundName = staffSenderName(message);
  const delay = { "--enter-delay": `${Math.min(index, 14) * 32}ms` } as React.CSSProperties;

  if (message.kind === "internal_note") {
    return (
      <article
        className="enter-up mx-auto w-full max-w-[40rem] rounded-[2.5rem] border border-dashed border-note/50 bg-note/8 px-6 py-3.5"
        style={delay}
        aria-label={`Internal note from ${outboundName}`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-note">
          <span>Internal · {outboundName}</span>
          <span className="text-muted">{formatStamp(message.createdAt)}</span>
          <span className="rounded-full border border-note/40 px-2 py-px text-note/90">
            Staff only
          </span>
        </div>
        <p className="text-[13.5px] leading-6 text-ink/90">{message.body}</p>
      </article>
    );
  }

  const outbound = message.kind === "sms_out";

  return (
    <article
      className={`enter-up flex w-full ${outbound ? "justify-end" : "justify-start"}`}
      style={delay}
      aria-label={
        outbound ? `SMS from ${outboundName}` : `SMS from driver ${inboundName}`
      }
    >
      <div
        className={`max-w-[min(34rem,88%)] rounded-full border px-6 py-3.5 ${
          outbound ? "border-amber/25 bg-amber/12" : "border-line bg-panel-raised"
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span className={outbound ? "text-amber" : "text-signal"}>
            {outbound ? `SMS · ${outboundName}` : inboundName}
          </span>
          {message.broadcastId ? (
            <span className="rounded-full border border-amber/40 px-2 py-px text-amber">
              Broadcast
            </span>
          ) : null}
          <span>{formatStamp(message.createdAt)}</span>
        </div>
        <p className="text-[14px] leading-6 text-ink">{message.body}</p>
      </div>
    </article>
  );
}
