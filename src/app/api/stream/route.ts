import { healthMonitor, ensureHealthMonitor } from "@/lib/health-monitor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  ensureHealthMonitor();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      const lastState = healthMonitor.getLastState();
      if (lastState) {
        send(lastState);
      } else {
        healthMonitor.check();
      }

      const onUpdate = (state: unknown) => send(state);
      healthMonitor.on("update", onUpdate);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 30000);

      request.signal.addEventListener("abort", () => {
        healthMonitor.off("update", onUpdate);
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
