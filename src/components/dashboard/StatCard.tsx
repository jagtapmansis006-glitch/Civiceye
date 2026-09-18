import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "civic",
}: {
  label: string;
  value: number | string;
  tone?: "civic" | "signal" | "verd" | "neutral";
}) {
  return (
    <div className="glass-panel-strong p-4">
      <p className="text-xs font-semibold text-ink/55">{label}</p>
      <p
        className={cn(
          "mt-1 font-serif text-3xl font-semibold",
          tone === "civic" && "text-civic-deep",
          tone === "signal" && "text-signal",
          tone === "verd" && "text-verd",
          tone === "neutral" && "text-ink/70",
        )}
      >
        {value}
      </p>
    </div>
  );
}
