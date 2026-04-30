import { Database, Inbox } from "lucide-react";
import { CRM_RECORDS, type CRMRecord } from "@/lib/dealmap-data";
import { Pill } from "./Badge";

interface Props {
  records: CRMRecord[];
  onImport: () => void;
}

function priorityTone(p: CRMRecord["priority"]) {
  return p === "High" ? "danger" : p === "Medium" ? "warning" : "neutral";
}

function segmentTone(s: string) {
  if (s.includes("Legal")) return "accent" as const;
  if (s.includes("Sales")) return "violet" as const;
  if (s.includes("Climate")) return "teal" as const;
  return "neutral" as const;
}

export function CRMTable({ records, onImport }: Props) {
  const isEmpty = records.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Demo CRM pipeline
          </span>
          <span className="text-xs text-muted-foreground">
            · {isEmpty ? "no records loaded" : `${records.length} startups`}
          </span>
        </div>
        <button
          onClick={onImport}
          className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-secondary"
        >
          {isEmpty ? "Import CRM Data" : "Re-sync"}
        </button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-14 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              No CRM records yet
            </div>
            <div className="mt-1 max-w-sm text-xs text-muted-foreground">
              Import your demo CRM to populate the pipeline and unlock the
              market map.
            </div>
          </div>
          <button
            onClick={onImport}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Import CRM Data
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5">Startup</th>
                <th className="px-5 py-2.5">Founder</th>
                <th className="px-5 py-2.5">Segment</th>
                <th className="px-5 py-2.5">Stage</th>
                <th className="px-5 py-2.5">Last Meeting</th>
                <th className="px-5 py-2.5">CRM Status</th>
                <th className="px-5 py-2.5 text-right">Priority</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.startup}
                  className="border-t border-border transition hover:bg-surface-muted/60"
                  style={{ animation: `fade-in-up 0.4s ease-out ${i * 60}ms both` }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-foreground">
                        {r.startup.slice(0, 2)}
                      </div>
                      <span className="font-medium text-foreground">
                        {r.startup}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.founder}</td>
                  <td className="px-5 py-3">
                    <Pill tone={segmentTone(r.segment)}>{r.segment}</Pill>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.stage}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {r.lastMeeting}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.status}</td>
                  <td className="px-5 py-3 text-right">
                    <Pill tone={priorityTone(r.priority)} dot>
                      {r.priority}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}