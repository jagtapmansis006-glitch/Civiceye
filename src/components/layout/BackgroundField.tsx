/** Soft ambient colour field behind every page (decorative, non-interactive). */
export function BackgroundField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-fog" />
      <div className="absolute -top-32 -left-32 size-[520px] rounded-full bg-civic/10" />
      <div className="absolute top-24 right-[-140px] size-[460px] rounded-full bg-signal/25" />
      <div className="absolute bottom-[-180px] left-1/3 size-[520px] rounded-full bg-verd/15" />
    </div>
  );
}
