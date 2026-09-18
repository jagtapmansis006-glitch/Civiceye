import { useReportMedia } from "@/hooks/useReports";

export function ReportMediaGallery({ reportId }: { reportId: string }) {
  const media = useReportMedia(reportId);
  if (media.isPending) return <p className="text-sm text-ink/55">Loading attachments…</p>;
  if (media.isError) return <p className="text-sm text-alert">Attachments could not be loaded.</p>;
  if (!media.data.length) return <p className="text-sm text-ink/55">No photos or videos were attached.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {media.data.map((m) => (
        <a
          key={m.id}
          href={m.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="block aspect-[4/3] overflow-hidden rounded-lg bg-muted ring-1 ring-black/10"
        >
          {m.url ? (
            m.media_type === "video" ? (
              <video src={m.url} className="size-full object-cover" controls muted />
            ) : (
              <img src={m.url} alt="Report attachment" className="size-full object-cover" loading="lazy" />
            )
          ) : (
            <span className="grid size-full place-items-center text-xs text-ink/50">Unavailable</span>
          )}
        </a>
      ))}
    </div>
  );
}
