import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RealtimeEvent, SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { useControlSocket } from "./use-control-socket";

// Seam: the hook's public contract — it owns the control socket's lifecycle and wires
// its frames into the cache, so components never touch a socket (CLAUDE.md §"Data &
// realtime"). We mock only openControlSocket (it opens a real WebSocket); sendControl
// and reconcile run for real, so the cache assertions observe genuine behavior. The
// captured onEvent stands in for the socket delivering an inbound echo.
const mock = vi.hoisted(() => {
  const socket = { send: vi.fn<(data: string) => void>(), close: vi.fn<() => void>() };
  const holder: { onEvent?: (event: RealtimeEvent) => void } = {};
  const openControlSocket = vi.fn(
    (options: { sessionId: string; onEvent: (event: RealtimeEvent) => void }) => {
      holder.onEvent = options.onEvent;
      return socket;
    },
  );
  return { socket, holder, openControlSocket };
});

vi.mock("@/lib/realtime/ws", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/realtime/ws")>();
  return { ...actual, openControlSocket: mock.openControlSocket };
});

function wrap(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const readStatus = (client: QueryClient) =>
  client.getQueryData<SessionDetail>(queryKeys.session("sess_01"))?.status;

beforeEach(() => {
  mock.openControlSocket.mockClear();
  mock.socket.send.mockClear();
  mock.socket.close.mockClear();
  mock.holder.onEvent = undefined;
});

describe("useControlSocket", () => {
  it("opens the control socket for the session on mount and closes it on unmount", () => {
    const client = new QueryClient();
    const { unmount } = renderHook(() => useControlSocket("sess_01"), { wrapper: wrap(client) });

    expect(mock.openControlSocket).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "sess_01" }),
    );
    expect(mock.socket.close).not.toHaveBeenCalled();

    unmount();
    expect(mock.socket.close).toHaveBeenCalledTimes(1);
  });

  it("optimistically reflects a steer in the cache and sends the command", () => {
    const client = new QueryClient();
    const { result } = renderHook(() => useControlSocket("sess_01"), { wrapper: wrap(client) });

    act(() => result.current("approve"));

    expect(readStatus(client)).toBe("active"); // optimistic guess
    const sent = mock.socket.send.mock.calls[0]?.[0] ?? "";
    expect(JSON.parse(sent)).toMatchObject({
      type: "control",
      sessionId: "sess_01",
      action: "approve",
    });
  });

  it("routes an inbound echo through reconcile into the cache", () => {
    const client = new QueryClient();
    renderHook(() => useControlSocket("sess_01"), { wrapper: wrap(client) });

    // The engine's authoritative echo, as the socket would deliver it.
    act(() =>
      mock.holder.onEvent?.({
        type: "control",
        sessionId: "sess_01",
        action: "interrupt",
        status: "needs_you",
      }),
    );

    expect(readStatus(client)).toBe("needs_you");
  });
});
