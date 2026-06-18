import { checkPing } from "./ping";
import { prisma } from "./prisma";

export type GateStatus = {
  id: string;
  name: string;
  ip: string;
  order: number;
  pingAlive: boolean;
  pingTime: number | null;
  effectiveStatus: "up" | "down" | "degraded";
  blockedBy: string | null;
  lastChecked: string;
};

export type DashboardState = {
  gates: GateStatus[];
  summary: {
    total: number;
    up: number;
    down: number;
    degraded: number;
  };
  lastUpdated: string;
};

export async function getGateStatuses(): Promise<DashboardState> {
  const gates = await prisma.gate.findMany({
    orderBy: { order: "asc" },
  });

  const now = new Date().toISOString();
  const pingResults = await Promise.all(
    gates.map(async (gate) => {
      const result = await checkPing(gate.ip);
      return { gate, result };
    })
  );

  let upstreamDown = false;
  let blockedByName: string | null = null;

  const statuses: GateStatus[] = pingResults.map(({ gate, result }) => {
    let effectiveStatus: GateStatus["effectiveStatus"];
    let blockedBy: string | null = null;

    if (!result.alive) {
      effectiveStatus = "down";
      upstreamDown = true;
      blockedByName = gate.name;
    } else if (upstreamDown) {
      effectiveStatus = "degraded";
      blockedBy = blockedByName;
    } else {
      effectiveStatus = "up";
    }

    return {
      id: gate.id,
      name: gate.name,
      ip: gate.ip,
      order: gate.order,
      pingAlive: result.alive,
      pingTime: result.time,
      effectiveStatus,
      blockedBy,
      lastChecked: now,
    };
  });

  return {
    gates: statuses,
    summary: {
      total: statuses.length,
      up: statuses.filter((g) => g.effectiveStatus === "up").length,
      down: statuses.filter((g) => g.effectiveStatus === "down").length,
      degraded: statuses.filter((g) => g.effectiveStatus === "degraded").length,
    },
    lastUpdated: now,
  };
}
