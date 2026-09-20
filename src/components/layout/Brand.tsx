import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  subtitle = "City Services",
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="CivicEye home">
      <span className="grid size-8 place-items-center rounded-lg bg-civic font-serif text-base font-semibold text-primary-foreground ring-1 ring-black/5">
        C
      </span>
      <span className="leading-none">
        <span className="block font-serif text-lg font-semibold text-civic">CivicEye</span>
        <span className="block text-[10px] uppercase tracking-[0.18em] text-ink/50">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
