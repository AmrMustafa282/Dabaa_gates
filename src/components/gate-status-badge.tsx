import type { GateStatus } from "@/lib/gate-status";
import { Badge } from "@/components/ui/badge";

export const statusConfig = {
  up: { label: "Online", variant: "success" as const },
  down: { label: "Down", variant: "destructive" as const },
  degraded: { label: "Degraded", variant: "warning" as const },
};

export function GateStatusBadge({ status }: { status: GateStatus["effectiveStatus"] }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function gateCardClass(status: GateStatus["effectiveStatus"]) {
  if (status === "down") return "border-red-500/50 bg-red-500/5";
  if (status === "degraded") return "border-amber-500/50 bg-amber-500/5";
  return "border-emerald-500/30";
}

export function gateOrderClass(status: GateStatus["effectiveStatus"]) {
  if (status === "up") return "bg-emerald-500/15 text-emerald-400";
  if (status === "down") return "bg-red-500/15 text-red-400";
  return "bg-amber-500/15 text-amber-400";
}
