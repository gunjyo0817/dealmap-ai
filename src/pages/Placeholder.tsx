import { Construction } from "lucide-react";

export default function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-3xl font-normal tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent"><Construction className="h-5 w-5" /></div>
        <h3 className="mt-3 text-sm font-semibold">Coming in Phase 2</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">This page is part of the next build wave. Your data is already being captured and will populate this view automatically.</p>
      </div>
    </div>
  );
}