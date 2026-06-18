import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { healthMonitor, ensureHealthMonitor } from "@/lib/health-monitor";
import { ensureSchema } from "@/lib/db-migrate";
import { writeLog } from "@/lib/logger";

export async function GET() {
  ensureHealthMonitor();
  await ensureSchema();
  const gates = await prisma.gate.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(gates);
}

export async function POST(request: Request) {
  ensureHealthMonitor();
  await ensureSchema();
  const body = await request.json();
  const { name, ip, order } = body;

  if (!name?.trim() || !ip?.trim()) {
    return NextResponse.json(
      { error: "Name and IP are required" },
      { status: 400 }
    );
  }

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip.trim())) {
    return NextResponse.json(
      { error: "Invalid IP address format" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.gate.aggregate({ _max: { order: true } });
  const gateOrder =
    typeof order === "number" ? order : (maxOrder._max.order ?? 0) + 1;

  const existing = await prisma.gate.findUnique({ where: { order: gateOrder } });
  if (existing) {
    return NextResponse.json(
      { error: `Order ${gateOrder} is already taken` },
      { status: 409 }
    );
  }

  const gate = await prisma.gate.create({
    data: { name: name.trim(), ip: ip.trim(), order: gateOrder },
  });

  await writeLog({
    gateId: gate.id,
    gateName: gate.name,
    ip: gate.ip,
    type: "gate_created",
    message: `Created gate "${gate.name}" at ${gate.ip} (order ${gate.order})`,
  });

  healthMonitor.check();
  return NextResponse.json(gate, { status: 201 });
}
