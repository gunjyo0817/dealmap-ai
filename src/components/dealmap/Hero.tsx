import { Pill } from "./Badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 md:pb-16 md:pt-20">
        <Pill tone="accent" dot className="mb-5">
          AI Market Map Copilot · Beta
        </Pill>
        <h1 className="max-w-3xl font-display text-4xl font-normal leading-[1.05] tracking-tight text-foreground md:text-6xl">
          From messy deal notes to{" "}
          <span className="italic text-accent">live market maps.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Structure deal flow, remember similar startups, and spot market
          opportunities from CRM records and meeting notes — without leaving
          your workflow.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            128 records synced
          </div>
          <div>4 active segments</div>
          <div>12 follow-up questions queued</div>
          <div>Last analysis · just now</div>
        </div>
      </div>
    </section>
  );
}