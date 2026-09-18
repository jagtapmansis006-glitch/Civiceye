import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_MEDIA_TYPES, MAX_MEDIA_FILES } from "@/services/media.service";

export function MediaUpload({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_MEDIA_FILES);
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MEDIA_TYPES}
        multiple
        className="sr-only"
        id="report-media"
        onChange={(e) => addFiles(e.target.files)}
      />
      <div className="flex flex-wrap gap-3">
        {previews.map(({ file, url }, i) => (
          <div key={url} className="relative size-24 overflow-hidden rounded-lg ring-1 ring-black/10">
            {file.type.startsWith("video/") ? (
              <video src={url} className="size-full object-cover" muted />
            ) : (
              <img src={url} alt={file.name} className="size-full object-cover" />
            )}
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-glass-strong text-ink ring-1 ring-black/10 hover:bg-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {files.length < MAX_MEDIA_FILES && (
          <Button type="button" variant="soft" className="h-24 w-24 flex-col gap-1 text-xs" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="size-5" />
            Add photo
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-ink/55">Up to {MAX_MEDIA_FILES} photos or short videos, 50 MB each.</p>
    </div>
  );
}
