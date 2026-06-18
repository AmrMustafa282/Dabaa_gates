import { EventEmitter } from "events";
import { getGateStatuses, type DashboardState } from "./gate-status";
import { writeLog } from "./logger";
import { ensureSchema } from "./db-migrate";

class HealthMonitor extends EventEmitter {
  private interval: ReturnType<typeof setInterval> | null = null;
  private lastState: DashboardState | null = null;
  private previousStatuses = new Map<string, string>();
  private checking = false;

  start(intervalMs = 10000) {
    if (this.interval) return;

    this.check();
    this.interval = setInterval(() => this.check(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async check() {
    if (this.checking) return;
    this.checking = true;

    try {
      await ensureSchema();
      const state = await getGateStatuses();
      await this.logStatusChanges(state);
      this.lastState = state;
      this.emit("update", state);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      this.checking = false;
    }
  }

  private async logStatusChanges(state: DashboardState) {
    for (const gate of state.gates) {
      const prev = this.previousStatuses.get(gate.id);
      if (prev !== undefined && prev !== gate.effectiveStatus) {
        await writeLog({
          gateId: gate.id,
          gateName: gate.name,
          ip: gate.ip,
          type: "status_change",
          status: gate.effectiveStatus,
          pingTime: gate.pingTime,
          message: `${gate.name} changed from ${prev} to ${gate.effectiveStatus}${
            gate.blockedBy ? ` (blocked by ${gate.blockedBy})` : ""
          }`,
        });
      }
      this.previousStatuses.set(gate.id, gate.effectiveStatus);
    }

    for (const id of [...this.previousStatuses.keys()]) {
      if (!state.gates.find((g) => g.id === id)) {
        this.previousStatuses.delete(id);
      }
    }
  }

  getLastState() {
    return this.lastState;
  }
}

const globalForMonitor = globalThis as unknown as {
  healthMonitor: HealthMonitor | undefined;
};

export const healthMonitor =
  globalForMonitor.healthMonitor ?? new HealthMonitor();

if (process.env.NODE_ENV !== "production") {
  globalForMonitor.healthMonitor = healthMonitor;
}

export function ensureHealthMonitor() {
  healthMonitor.start(
    parseInt(process.env.HEALTH_CHECK_INTERVAL_MS ?? "10000", 10)
  );
}
