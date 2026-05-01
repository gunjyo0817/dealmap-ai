import { Download, Upload, Wand2 } from "lucide-react";
import { Pill } from "./Badge";

interface Props {
  onImport: () => void;
  onGenerate: () => void;
  onExport: () => void;
  generating: boolean;
}

export function TopNav({ onImport, onGenerate, onExport, generating }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DealMap AI logo" className="h-9 w-9 rounded-lg object-cover shadow-card-md" />
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                DealMap <span className="text-accent">AI</span>
              </span>
              <span className="hidden h-4 w-px bg-border md:block" />
              <span className="hidden text-xs text-muted-foreground md:block">
                Turn VC notes into live market maps
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Pill tone="success" dot className="hidden sm:inline-flex">
            Demo CRM connected
          </Pill>
          <button
            onClick={onImport}
            className="hidden items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary md:inline-flex"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CRM Data
          </button>
          <button
            onClick={onExport}
            className="hidden items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary md:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            Export Map
          </button>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-card-md transition hover:opacity-90 disabled:opacity-60"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate Market Map"}
          </button>
        </div>
      </div>
    </header>
  );
}