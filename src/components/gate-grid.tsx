"use client";

import type { GateStatus } from "@/lib/gate-status";
import { Card, CardContent } from "@/components/ui/card";
import {
  GateStatusBadge,
  gateCardClass,
  gateOrderClass,
} from "@/components/gate-status-badge";
import { GateActions } from "@/components/gate-actions";
import { Server } from "lucide-react";

export function GateGrid({
  gates,
  onEdit,
  onDelete,
}: {
  gates: GateStatus[];
  onEdit: (gate: { id: string; name: string; ip: string; order: number }) => void;
  onDelete: (id: string) => void;
}) {
  if (gates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Server className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No gates match your filters</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {gates.map((gate) => (
        <Card key={gate.id} className={gateCardClass(gate.effectiveStatus)}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${gateOrderClass(gate.effectiveStatus)}`}
              >
                {gate.order}
              </div>
              <GateActions gate={gate} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{gate.name}</span>
                <GateStatusBadge status={gate.effectiveStatus} />
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1">{gate.ip}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              {gate.pingTime !== null && <p>Ping: {gate.pingTime}ms</p>}
              {gate.blockedBy && (
                <p className="text-amber-400">Blocked by {gate.blockedBy}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
