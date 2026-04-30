import { useRef, useState } from "react";
import { TopNav } from "@/components/dealmap/TopNav";
import { Hero } from "@/components/dealmap/Hero";
import { IntegrationCards } from "@/components/dealmap/IntegrationCards";
import { NotesInput } from "@/components/dealmap/NotesInput";
import { CRMTable } from "@/components/dealmap/CRMTable";
import { MarketMap } from "@/components/dealmap/MarketMap";
import { EmptyState, LoadingState } from "@/components/dealmap/EmptyState";
import {
  CRM_RECORDS,
  SAMPLE_NOTES,
  type CRMRecord,
} from "@/lib/dealmap-data";
import { useToast } from "@/hooks/use-toast";

type Status = "empty" | "loading" | "ready";

const Index = () => {
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("empty");
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const handleImport = () => {
    setRecords(CRM_RECORDS);
    setError(null);
    toast({
      title: "CRM data imported",
      description: `Loaded ${CRM_RECORDS.length} demo startup records.`,
    });
  };

  const handleLoadSample = () => {
    setNotes(SAMPLE_NOTES);
    setError(null);
  };

  const handleGenerate = () => {
    if (notes.trim().length === 0 && records.length === 0) {
      setError("Add CRM data or paste meeting notes before generating a map.");
      toast({
        title: "Nothing to analyze",
        description: "Import CRM data or load sample notes first.",
        variant: "destructive",
      });
      return;
    }
    setError(null);
    setStatus("loading");
    setTimeout(() => {
      setStatus("ready");
      requestAnimationFrame(() =>
        mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }, 1600);
  };

  const handleExport = () => {
    toast({
      title: status === "ready" ? "Market map exported" : "Generate a map first",
      description:
        status === "ready"
          ? "Demo export — a PDF would be generated in production."
          : "Run an analysis before exporting.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav
        onImport={handleImport}
        onGenerate={handleGenerate}
        onExport={handleExport}
        generating={status === "loading"}
      />

      <main>
        <Hero />

        <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 md:py-14">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Connected sources
                </h2>
                <p className="text-xs text-muted-foreground">
                  All running on demo data — no external calls.
                </p>
              </div>
            </div>
            <IntegrationCards />
          </section>

          <section className="grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <NotesInput
                notes={notes}
                setNotes={setNotes}
                onLoadSample={handleLoadSample}
                onGenerate={handleGenerate}
                generating={status === "loading"}
                error={error}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="h-full rounded-xl border border-border bg-gradient-to-br from-surface to-surface-muted p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">
                  How it works
                </h3>
                <ol className="mt-3 space-y-2.5 text-xs text-muted-foreground">
                  {[
                    "Import CRM data from connected sources.",
                    "Load sample notes or paste your own.",
                    "Generate a market map and act on follow-ups.",
                  ].map((s, i) => (
                    <li key={s} className="flex gap-2.5">
                      <span className="font-mono text-[11px] font-semibold text-accent">
                        0{i + 1}
                      </span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section>
            <CRMTable records={records} onImport={handleImport} />
          </section>

          <section ref={mapRef} className="scroll-mt-24">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-normal tracking-tight text-foreground">
                  Market map
                </h2>
                <p className="text-xs text-muted-foreground">
                  Live view across segments, profiles, and follow-ups.
                </p>
              </div>
            </div>

            {status === "empty" && <EmptyState onGenerate={handleGenerate} />}
            {status === "loading" && <LoadingState />}
            {status === "ready" && <MarketMap />}
          </section>
        </div>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
            <span>
              © 2026 DealMap AI · Demo build · No real CRM data is used.
            </span>
            <span className="font-mono">v0.1.0 · build a3f9</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
