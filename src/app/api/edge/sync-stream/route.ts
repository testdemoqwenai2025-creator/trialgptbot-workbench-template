import { generateRandomSyncEvent } from "@/lib/trialgptbot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-Sent Events (SSE) endpoint that emulates a live WebSocket feed
 * of edge sync events. The client opens an `EventSource` connection to
 * `/api/edge/sync-stream` and receives a new event every ~3-7 seconds,
 * simulating the real-time stream of (queue, sync_started, sync_completed,
 * conflict, merged) events across all edge-deployed sites.
 *
 * This avoids requiring a custom Next.js server for WebSocket support
 * while delivering the same "entries stream in live" UX requested.
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        const payload =
          `event: ${event}\n` +
          `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          closed = true;
        }
      };

      // 1) initial hello so the client knows the stream is alive
      send("ready", {
        ts: new Date().toISOString(),
        message: "edge sync stream connected — events will arrive every ~3-7s",
      });

      // 2) immediately push a couple of seed events so the UI isn't empty
      send("sync", generateRandomSyncEvent());
      setTimeout(() => send("sync", generateRandomSyncEvent()), 800);

      // 3) periodic tick — randomised 3-7s interval to feel organic
      const tick = () => {
        if (closed) return;
        send("sync", generateRandomSyncEvent());
        timer = setTimeout(tick, 3000 + Math.random() * 4000);
      };
      let timer = setTimeout(tick, 2500);

      // 4) keep-alive comment every 25s (best-effort across proxies)
      const keepalive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
        } catch {
          closed = true;
        }
      }, 25000);

      // cleanup when the client disconnects
      return () => {
        closed = true;
        clearTimeout(timer);
        clearInterval(keepalive);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
    },
    cancel() {
      /* the controller is cleaned up via start()'s return */
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable proxy buffering (nginx)
      "Access-Control-Allow-Origin": "*",
    },
  });
}
