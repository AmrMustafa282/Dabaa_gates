"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { StatusFilter, ViewMode } from "@/lib/gate-filters";
import {
  Search,
  LayoutList,
  Table2,
  LayoutGrid,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "up", label: "Online" },
  { value: "down", label: "Down" },
  { value: "degraded", label: "Degraded" },
];

const viewModes: { value: ViewMode; icon: typeof LayoutList; label: string }[] = [
  { value: "chain", icon: LayoutList, label: "Chain" },
  { value: "table", icon: Table2, label: "Table" },
  { value: "grid", icon: LayoutGrid, label: "Grid" },
];

export function GateToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, IP, or order..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex rounded-lg border p-1 gap-0.5">
          {viewModes.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={viewMode === value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange(value)}
              title={label}
              className="gap-1.5"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => onStatusFilterChange(f.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              statusFilter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
          >
            {f.label}
          </button>
        ))}
        {(search || statusFilter !== "all") && (
          <span className="text-xs text-muted-foreground ml-auto">
            Showing {resultCount} of {totalCount}
          </span>
        )}
      </div>
    </div>
  );
}
