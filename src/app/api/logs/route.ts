import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-migrate";
import { ensureHealthMonitor } from "@/lib/health-monitor";

export async function GET(request: Request) {
  ensureHealthMonitor();
  await ensureSchema();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const gateId = searchParams.get("gateId");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const where: {
    type?: string;
    gateId?: string;
    OR?: Array<{ gateName?: { contains: string }; message?: { contains: string }; ip?: { contains: string } }>;
  } = {};

  if (type && type !== "all") where.type = type;
  if (gateId) where.gateId = gateId;
  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { gateName: { contains: q } },
      { message: { contains: q } },
      { ip: { contains: q } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.healthLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.healthLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, limit, offset });
}

export async function DELETE() {
  await ensureSchema();
  await prisma.healthLog.deleteMany();
  return NextResponse.json({ success: true });
}
