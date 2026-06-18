"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, RefreshCw, ScrollText } from "lucide-react";

type LogEntry = {
  id: string;
  gateId: string | null;
  gateName: string;
  ip: string | null;
  type: string;
  status: string | null;
  pingTime: number | null;
  message: string;
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  status_change: "Status",
  ping: "Ping",
  gate_created: "Created",
  gate_updated: "Updated",
  gate_deleted: "Deleted",
  import: "Import",
  export: "Export",
  system: "System",
};

const typeVariants: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  status_change: "warning",
  gate_created: "success",
  gate_deleted: "destructive",
  import: "secondary",
  export: "secondary",
};

export function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (search.trim()) params.set("search", search.trim());
    if (typeFilter !== "all") params.set("type", typeFilter);

    const res = await fetch(`/api/logs?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const clearLogs = async () => {
    if (!confirm("Clear all logs? This cannot be undone.")) return;
    await fetch("/api/logs", { method: "DELETE" });
    fetchLogs();
  };

  const types = ["all", ...Object.keys(typeLabels)];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">{total} entries</span>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              typeFilter === t
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : typeLabels[t] ?? t}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <ScrollText className="h-12 w-12 mb-4" />
              <p>No logs yet. Events will appear here as gates are monitored.</p>
            </div>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 hover:bg-muted/20 text-sm">
                  <div className="shrink-0 w-36 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <Badge variant={typeVariants[log.type] ?? "secondary"} className="shrink-0 h-fit">
                    {typeLabels[log.type] ?? log.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p>{log.message}</p>
                    {log.gateName !== "System" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {log.gateName}
                        {log.ip && ` · ${log.ip}`}
                        {log.pingTime !== null && ` · ${log.pingTime}ms`}
                      </p>
                    )}
                  </div>
                  {log.status && (
                    <Badge
                      variant={
                        log.status === "up"
                          ? "success"
                          : log.status === "down"
                            ? "destructive"
                            : "warning"
                      }
                      className="shrink-0 h-fit"
                    >
                      {log.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
