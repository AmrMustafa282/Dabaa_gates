import type { GateStatus } from "./gate-status";

export type ViewMode = "chain" | "table" | "grid";
export type StatusFilter = "all" | "up" | "down" | "degraded";

export function filterGates(
  gates: GateStatus[],
  search: string,
  statusFilter: StatusFilter
): GateStatus[] {
  const query = search.trim().toLowerCase();

  return gates.filter((gate) => {
    if (statusFilter !== "all" && gate.effectiveStatus !== statusFilter) {
      return false;
    }
    if (!query) return true;
    return (
      gate.name.toLowerCase().includes(query) ||
      gate.ip.toLowerCase().includes(query) ||
      String(gate.order).includes(query)
    );
  });
}
