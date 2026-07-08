import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { getSessionFromRequest } from "@/server/auth/service";
import { handleControlMessage } from "@/server/realtime/gateway";
import { getBackplane } from "@/server/redis";

// Custom Node entry for the WS gateway (ARCHITECTURE.md §"WebSocket fan-out"). Next
// route handlers can't upgrade a socket, so we boot Next behind an http server and
// take over `/api/ws` ourselves: authenticate the cookie, subscribe the socket to the
// session's backplane channel (cross-task via Redis), and route inbound control
// messages through the gateway. Run with `node server.js` after `next build`.

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const backplane = getBackplane();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res, parse(req.url ?? "/", true)));
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (req, socket, head) => {
    const { pathname, query } = parse(req.url ?? "", true);
    const sessionId = typeof query.sessionId === "string" ? query.sessionId : "";
    if (pathname !== "/api/ws" || !sessionId) {
      socket.destroy();
      return;
    }

    // Authenticate off the same session cookie the middleware verifies.
    const request = new Request(`http://${hostname}${req.url}`, {
      headers: { cookie: req.headers.cookie ?? "" },
    });
    if (!(await getSessionFromRequest(request))) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      void bindSocket(ws, sessionId);
    });
  });

  server.listen(port, hostname);
});

async function bindSocket(ws: WebSocket, sessionId: string): Promise<void> {
  // Outbound: every backplane event for this session (from any task) → this socket.
  const unsubscribe = await backplane.subscribe(sessionId, (event) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(event));
  });
  // Inbound: steering commands → the gateway (which fans the echo back out).
  ws.on("message", (data: unknown) => {
    void handleControlMessage(String(data), backplane);
  });
  ws.on("close", () => {
    void unsubscribe();
  });
}
