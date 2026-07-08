import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SessionDetail, SessionMessage } from "@/features/sessions/realtime";
import { SessionTranscript } from "./session-transcript";

// Seam: the live view's public output (CONTEXT.md §Components). It renders whatever
// reconcile() has written into the cache — a streaming transcript, status, progress.

const message: SessionMessage = {
  id: "m1",
  agent: "Builder",
  text: "Analyzing the auth module",
  pending: true,
};
const detail: SessionDetail = {
  id: "sess_01",
  title: "Refactor auth module",
  status: "active",
  steps: { completed: 2, total: 5 },
  transcript: [message],
  updatedAt: "",
};

describe("SessionTranscript", () => {
  it("renders the streamed transcript text", () => {
    render(<SessionTranscript detail={detail} />);
    expect(screen.getByText(/analyzing the auth module/i)).toBeInTheDocument();
  });

  it("marks a message as streaming while it is pending", () => {
    render(<SessionTranscript detail={detail} />);
    expect(screen.getByText(/streaming/i)).toBeInTheDocument();
  });

  it("drops the streaming marker once the message settles", () => {
    render(
      <SessionTranscript detail={{ ...detail, transcript: [{ ...message, pending: false }] }} />,
    );
    expect(screen.queryByText(/streaming/i)).not.toBeInTheDocument();
  });

  it("shows the session status and step progress", () => {
    render(<SessionTranscript detail={detail} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/2\/5 steps/i)).toBeInTheDocument();
  });

  it("shows a connecting state before the first snapshot arrives", () => {
    render(<SessionTranscript />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });
});
