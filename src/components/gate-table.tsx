"use client";

import type { GateStatus } from "@/lib/gate-status";
import { Card, CardContent } from "@/components/ui/card";
import { GateStatusBadge } from "@/components/gate-status-badge";
import { GateActions } from "@/components/gate-actions";
import { Server } from "lucide-react";

export function GateTable({
  gates,
  onEdit,
  onDelete,
}: {
  gates: GateStatus[];
  onEdit: (gate: { id: string; name: string; ip: string; order: number }) => void;
  onDelete: (id: string) => void;
}) {
  if (gates.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left font-medium p-4">Order</th>
                <th className="text-left font-medium p-4">Name</th>
                <th className="text-left font-medium p-4">IP</th>
                <th className="text-left font-medium p-4">Status</th>
                <th className="text-left font-medium p-4">Ping</th>
                <th className="text-left font-medium p-4">Blocked By</th>
                <th className="text-right font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gates.map((gate) => (
                <tr key={gate.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4 font-mono">{gate.order}</td>
                  <td className="p-4 font-medium">{gate.name}</td>
                  <td className="p-4 font-mono text-muted-foreground">{gate.ip}</td>
                  <td className="p-4">
                    <GateStatusBadge status={gate.effectiveStatus} />
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {gate.pingTime !== null ? `${gate.pingTime}ms` : "—"}
                  </td>
                  <td className="p-4 text-amber-400">
                    {gate.blockedBy ?? "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end">
                      <GateActions gate={gate} onEdit={onEdit} onDelete={onDelete} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Server className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No gates match your filters</h3>
        <p className="text-muted-foreground mt-1">Try adjusting search or status filters.</p>
      </CardContent>
    </Card>
  );
}
