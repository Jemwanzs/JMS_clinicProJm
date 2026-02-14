import { useState, useEffect } from "react";
import { Shield, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAuditEntries, type AuditEntry } from "@/lib/store";
import { exportToCSV } from "@/lib/export-utils";

export default function AuditLog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { setEntries(getAuditEntries()); }, []);

  const filtered = entries.filter(e =>
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.module.toLowerCase().includes(search.toLowerCase()) ||
    e.details.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filtered.map(e => ({
      Action: e.action, Module: e.module, Details: e.details,
      User: e.user, Timestamp: new Date(e.timestamp).toLocaleString(),
    })), "audit-log.csv");
    toast({ title: "Exported", description: `${filtered.length} entries exported.` });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Audit Log</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Track all system activity and changes.</p>
        </div>
        <Button variant="outline" className="gap-2 text-xs w-full sm:w-auto" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" />Export
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search audit log..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 sm:p-16 text-center">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No activity recorded</p>
          <p className="text-xs text-muted-foreground mt-1">All system actions will be logged here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id} className="rounded-lg border border-border bg-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{entry.action}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{entry.module}</span>
              </div>
              <p className="text-xs text-card-foreground flex-1 break-words">{entry.details}</p>
              <div className="text-[10px] text-muted-foreground shrink-0">
                <span>{entry.user}</span> • <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
