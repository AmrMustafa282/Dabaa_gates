"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardState } from "@/lib/gate-status";
import { filterGates, type StatusFilter, type ViewMode } from "@/lib/gate-filters";
import { SummaryCards } from "./summary-cards";
import { GateChain } from "./gate-chain";
import { GateTable } from "./gate-table";
import { GateGrid } from "./gate-grid";
import { GateToolbar } from "./gate-toolbar";
import { GateFormDialog } from "./gate-form-dialog";
import { LogsPanel } from "./logs-panel";
import { DataManagerDialog } from "./data-manager-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCw, Database, Activity, ScrollText } from "lucide-react";

export function Dashboard() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [connected, setConnected] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<{
    id: string;
    name: string;
    ip: string;
    order: number;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("chain");

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as DashboardState;
      setState(data);
    };
    eventSource.onerror = () => setConnected(false);

    return () => eventSource.close();
  }, []);

  const refresh = async () => {
    const res = await fetch("/api/health");
    if (res.ok) setState(await res.json());
  };

  const filteredGates = useMemo(
    () => filterGates(state?.gates ?? [], search, statusFilter),
    [state?.gates, search, statusFilter]
  );

  const handleEdit = (gate: { id: string; name: string; ip: string; order: number }) => {
    setEditingGate(gate);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/gates/${id}`, { method: "DELETE" });
    refresh();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingGate(null);
  };

  const renderGates = () => {
    const props = {
      gates: filteredGates,
      onEdit: handleEdit,
      onDelete: handleDelete,
    };
    if (viewMode === "table") return <GateTable {...props} />;
    if (viewMode === "grid") return <GateGrid {...props} />;
    return <GateChain {...props} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gates Dashboard</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Real-time gate chain monitoring
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${
                connected ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {connected ? "Live" : "Disconnected"}
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={refresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setDataOpen(true)}>
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Gate
          </Button>
        </div>
      </div>

      {state && <SummaryCards summary={state.summary} lastUpdated={state.lastUpdated} />}

      <Tabs defaultValue="monitor">
        <TabsList>
          <TabsTrigger value="monitor" className="gap-1.5">
            <Activity className="h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5">
            <ScrollText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <GateToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultCount={filteredGates.length}
            totalCount={state?.gates.length ?? 0}
          />
          {renderGates()}
        </TabsContent>

        <TabsContent value="logs">
          <LogsPanel />
        </TabsContent>
      </Tabs>

      <GateFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose();
          else setFormOpen(true);
        }}
        gate={editingGate}
        onSuccess={() => {
          handleFormClose();
          refresh();
        }}
      />

      <DataManagerDialog
        open={dataOpen}
        onOpenChange={setDataOpen}
        onImportSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}
