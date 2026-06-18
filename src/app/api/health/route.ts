import { NextResponse } from "next/server";
import { getGateStatuses } from "@/lib/gate-status";
import { ensureHealthMonitor } from "@/lib/health-monitor";

export async function GET() {
  ensureHealthMonitor();
  const state = await getGateStatuses();
  return NextResponse.json(state);
}
