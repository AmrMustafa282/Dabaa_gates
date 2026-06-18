import ping from "ping";

export type PingResult = {
  alive: boolean;
  time: number | null;
  error?: string;
};

export async function checkPing(ip: string): Promise<PingResult> {
  try {
    const result = await ping.promise.probe(ip, {
      timeout: 3,
      min_reply: 1,
    });

    return {
      alive: result.alive,
      time:
        result.alive && typeof result.time === "number"
          ? Math.round(result.time)
          : null,
    };
  } catch (error) {
    return {
      alive: false,
      time: null,
      error: error instanceof Error ? error.message : "Ping failed",
    };
  }
}
