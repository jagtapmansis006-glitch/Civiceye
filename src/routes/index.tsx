import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StatusPipeline } from "@/components/reports/StatusTimeline";
import { Button } from "@/components/ui/button";
import { REPORT_CATEGORIES } from "@/lib/report-categories";
import { REPORT_STATUS_ORDER, REPORT_STATUS } from "@/lib/report-status";

const TITLE = "CivicEye — Report civic issues, track them to resolution";
const DESCRIPTION =
  "Report potholes, garbage, broken streetlights, drainage and water problems with a photo and location. Follow every report from submission to closure.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-7xl px-6">
        <section className="grid items-center gap-8 pt-16 pb-12 md:pt-24 md:pb-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-civic/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-civic ring-1 ring-civic/15">
              Municipal services portal
            </span>
            <h1 className="mt-5 max-w-[30ch] font-serif text-4xl font-semibold leading-tight text-balance text-civic-deep md:text-5xl">
              Report a civic issue. Watch it close the loop.
            </h1>
            <p className="mt-5 max-w-[48ch] text-base text-pretty text-ink/70 md:text-lg">
              File a pothole, a blocked drain, or a broken streetlight. CivicEye tracks every report from first photo
              to field verification, so you always know where things stand.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/reports/new">Report an issue</Link>
              </Button>
              <Button asChild variant="soft" size="lg">
                <Link to="/reports">Track a report</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink/55">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-verd" />
                Accessible by design
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-signal" />
                Photo &amp; location capture
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-civic/60" />
                Public record
              </span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-panel space-y-5 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">How a report moves</p>
                  <p className="font-serif text-xl font-semibold text-civic-deep">Eight accountable stages</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-civic/5 px-2.5 py-1 text-civic ring-1 ring-civic/15">Reviewed</span>
                  <span className="rounded-full bg-signal/10 px-2.5 py-1 text-signal ring-1 ring-signal/25">Worked on</span>
                  <span className="rounded-full bg-verd/10 px-2.5 py-1 text-verd ring-1 ring-verd/25">Confirmed by you</span>
                </div>
              </div>

              <div className="rounded-xl bg-civic/[0.04] p-4 ring-1 ring-black/5">
                <StatusPipeline />
              </div>

              <ul className="grid gap-2 rounded-xl bg-glass-strong p-4 text-sm ring-1 ring-black/5 sm:grid-cols-2">
                {REPORT_STATUS_ORDER.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="font-semibold text-ink">{REPORT_STATUS[s].label}.</span>
                    <span className="text-ink/60">{REPORT_STATUS[s].description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 py-10">
          <div className="mx-auto max-w-[40ch] text-center">
            <h2 className="font-serif text-2xl font-semibold text-balance text-civic-deep">How it works</h2>
            <p className="mt-2 text-sm text-pretty text-ink/60">A clear, accountable path from your photo to a fixed street.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Step n="1" tone="civic" title="File it" body="Pick a category, add a note, attach a photo, and drop a location pin." />
            <Step n="2" tone="signal" title="It's checked" body="Authorities verify the report and route it to the right field team." />
            <Step n="3" tone="verd" title="You confirm" body="Once crews mark it resolved, you verify the fix and the record closes." />
          </div>
        </section>

        <section id="issue-types" className="scroll-mt-20 py-10">
          <div className="max-w-[40ch]">
            <h2 className="font-serif text-2xl font-semibold text-balance text-civic-deep">What you can report</h2>
            <p className="mt-2 text-sm text-pretty text-ink/60">Every category maps to a department responsible for the fix.</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {REPORT_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                to="/reports/new"
                className="glass-panel-strong p-4 transition-colors hover:bg-white/90"
              >
                <p className="text-sm font-semibold text-ink">{c.label}</p>
                <p className="mt-1 text-xs text-ink/50">{c.department}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-10 pb-16">
          <div className="rounded-2xl bg-civic/5 p-6 ring-1 ring-black/5 backdrop-blur-md md:p-8">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div className="max-w-[52ch]">
                <h2 className="font-serif text-2xl font-semibold text-balance text-civic-deep">A public service, in the open.</h2>
                <p className="mt-2 text-sm text-pretty text-ink/65">
                  CivicEye is operated by the municipal works division. Every report is a public record, response
                  times are published, and none of your data is sold or shared for advertising.
                </p>
              </div>
              <Button asChild>
                <Link to="/register">Create an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Step({ n, tone, title, body }: { n: string; tone: "civic" | "signal" | "verd"; title: string; body: string }) {
  const toneClass =
    tone === "civic"
      ? "bg-civic/8 text-civic ring-civic/15"
      : tone === "signal"
        ? "bg-signal/10 text-signal ring-signal/20"
        : "bg-verd/10 text-verd ring-verd/20";
  return (
    <div className="glass-panel p-5">
      <span className={`inline-flex size-8 items-center justify-center rounded-lg font-serif font-semibold ring-1 ${toneClass}`}>{n}</span>
      <p className="mt-4 font-serif text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1.5 text-sm text-pretty text-ink/60">{body}</p>
    </div>
  );
}
