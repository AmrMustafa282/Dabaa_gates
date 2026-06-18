import { prisma } from "./prisma";

export type LogType =
  | "status_change"
  | "ping"
  | "gate_created"
  | "gate_updated"
  | "gate_deleted"
  | "import"
  | "export"
  | "system";

const MAX_LOGS = 2000;

export async function writeLog(entry: {
  gateId?: string | null;
  gateName: string;
  ip?: string | null;
  type: LogType;
  status?: string | null;
  pingTime?: number | null;
  message: string;
}) {
  try {
    await prisma.healthLog.create({
      data: {
        gateId: entry.gateId ?? null,
        gateName: entry.gateName,
        ip: entry.ip ?? null,
        type: entry.type,
        status: entry.status ?? null,
        pingTime: entry.pingTime ?? null,
        message: entry.message,
      },
    });

    const count = await prisma.healthLog.count();
    if (count > MAX_LOGS) {
      const oldest = await prisma.healthLog.findMany({
        orderBy: { createdAt: "asc" },
        take: count - MAX_LOGS,
        select: { id: true },
      });
      await prisma.healthLog.deleteMany({
        where: { id: { in: oldest.map((l) => l.id) } },
      });
    }
  } catch (error) {
    console.error("Failed to write log:", error);
  }
}
