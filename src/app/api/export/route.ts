import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-migrate";
import { writeLog } from "@/lib/logger";
import { ensureHealthMonitor, healthMonitor } from "@/lib/health-monitor";

export async function GET(request: Request) {
  ensureHealthMonitor();
  await ensureSchema();

  const { searchParams } = new URL(request.url);
  const includeLogs = searchParams.get("includeLogs") === "true";

  const gates = await prisma.gate.findMany({ orderBy: { order: "asc" } });
  const logs = includeLogs
    ? await prisma.healthLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
      })
    : undefined;

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    gates: gates.map((g) => ({
      name: g.name,
      ip: g.ip,
      order: g.order,
    })),
    ...(includeLogs && { logs }),
  };

  await writeLog({
    gateName: "System",
    type: "export",
    message: `Exported ${gates.length} gate(s)${includeLogs ? " with logs" : ""}`,
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="gates-export-${Date.now()}.json"`,
    },
  });
}

type ImportGate = { name: string; ip: string; order: number };

export async function POST(request: Request) {
  await ensureSchema();

  const body = await request.json();
  const mode = body.mode === "merge" ? "merge" : "replace";
  const gates: ImportGate[] = body.gates;

  if (!Array.isArray(gates) || gates.length === 0) {
    return NextResponse.json(
      { error: "Invalid import: gates array is required" },
      { status: 400 }
    );
  }

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  for (const gate of gates) {
    if (!gate.name?.trim() || !gate.ip?.trim() || typeof gate.order !== "number") {
      return NextResponse.json(
        { error: "Each gate must have name, ip, and order" },
        { status: 400 }
      );
    }
    if (!ipRegex.test(gate.ip.trim())) {
      return NextResponse.json(
        { error: `Invalid IP: ${gate.ip}` },
        { status: 400 }
      );
    }
  }

  const orders = gates.map((g) => g.order);
  if (new Set(orders).size !== orders.length) {
    return NextResponse.json(
      { error: "Duplicate order values in import" },
      { status: 400 }
    );
  }

  if (mode === "replace") {
    await prisma.gate.deleteMany();
  }

  let imported = 0;
  for (const gate of gates.sort((a, b) => a.order - b.order)) {
    const existing = await prisma.gate.findUnique({
      where: { order: gate.order },
    });

    if (existing && mode === "merge") {
      await prisma.gate.update({
        where: { id: existing.id },
        data: { name: gate.name.trim(), ip: gate.ip.trim() },
      });
    } else if (!existing) {
      await prisma.gate.create({
        data: {
          name: gate.name.trim(),
          ip: gate.ip.trim(),
          order: gate.order,
        },
      });
      imported++;
    }
  }

  await writeLog({
    gateName: "System",
    type: "import",
    message: `Imported ${gates.length} gate(s) (${mode} mode)`,
  });

  ensureHealthMonitor();
  healthMonitor.check();

  const allGates = await prisma.gate.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({
    success: true,
    mode,
    imported,
    total: allGates.length,
    gates: allGates,
  });
}
