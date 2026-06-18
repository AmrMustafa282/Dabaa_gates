"use client";

import type { GateStatus } from "@/lib/gate-status";
import { Card, CardContent } from "@/components/ui/card";
import {
  GateStatusBadge,
  gateCardClass,
  gateOrderClass,
} from "@/components/gate-status-badge";
import { GateActions } from "@/components/gate-actions";
import { ArrowRight, Server } from "lucide-react";

export function GateChain({
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
          <p className="text-muted-foreground mt-1 max-w-sm">
            Try adjusting search or status filters, or add a new gate.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {gates.map((gate, index) => (
        <div key={gate.id} className="flex items-center gap-3">
          {index > 0 && (
            <div className="hidden sm:flex items-center justify-center w-8 shrink-0">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          {index === 0 && <div className="hidden sm:block w-8 shrink-0" />}

          <Card className={`flex-1 transition-colors ${gateCardClass(gate.effectiveStatus)}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${gateOrderClass(gate.effectiveStatus)}`}
                >
                  {gate.order}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{gate.name}</span>
                    <GateStatusBadge status={gate.effectiveStatus} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {gate.ip}
                    {gate.pingTime !== null && (
                      <span className="ml-2">· {gate.pingTime}ms</span>
                    )}
                    {gate.blockedBy && (
                      <span className="ml-2 text-amber-400">
                        · Blocked by {gate.blockedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <GateActions gate={gate} onEdit={onEdit} onDelete={onDelete} />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
