import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { healthMonitor, ensureHealthMonitor } from "@/lib/health-monitor";
import { writeLog } from "@/lib/logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const gate = await prisma.gate.findUnique({ where: { id } });

  if (!gate) {
    return NextResponse.json({ error: "Gate not found" }, { status: 404 });
  }

  return NextResponse.json(gate);
}

export async function PUT(request: Request, { params }: RouteParams) {
  ensureHealthMonitor();
  const { id } = await params;
  const body = await request.json();
  const { name, ip, order } = body;

  const existing = await prisma.gate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Gate not found" }, { status: 404 });
  }

  if (ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip.trim())) {
      return NextResponse.json(
        { error: "Invalid IP address format" },
        { status: 400 }
      );
    }
  }

  if (typeof order === "number" && order !== existing.order) {
    const orderTaken = await prisma.gate.findUnique({ where: { order } });
    if (orderTaken && orderTaken.id !== id) {
      return NextResponse.json(
        { error: `Order ${order} is already taken` },
        { status: 409 }
      );
    }
  }

  const gate = await prisma.gate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(ip !== undefined && { ip: ip.trim() }),
      ...(typeof order === "number" && { order }),
    },
  });

  await writeLog({
    gateId: gate.id,
    gateName: gate.name,
    ip: gate.ip,
    type: "gate_updated",
    message: `Updated gate "${gate.name}" → ${gate.ip} (order ${gate.order})`,
  });

  healthMonitor.check();
  return NextResponse.json(gate);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  ensureHealthMonitor();
  const { id } = await params;

  const existing = await prisma.gate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Gate not found" }, { status: 404 });
  }

  await prisma.gate.delete({ where: { id } });

  await writeLog({
    gateName: existing.name,
    ip: existing.ip,
    type: "gate_deleted",
    message: `Deleted gate "${existing.name}" (${existing.ip})`,
  });

  healthMonitor.check();
  return NextResponse.json({ success: true });
}
