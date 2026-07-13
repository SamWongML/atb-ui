import { describe, expect, it } from "vitest";
import { EMPTY_LIST_PREFS, type ListPrefs, parseListPrefs, serializeListPrefs } from "./list-prefs";

// Seam: the cookie <-> state boundary for list-screen toolbar prefs. This is the SSR read
// path — the server parses this cookie to render the saved view on first paint (no refresh
// flash), so a malformed value must degrade to empty, never throw. Round-trip is asserted
// against hand-written literals (independent source of truth), not by recomputation.

const SAMPLE: ListPrefs = {
  query: { agents: { status: "idle", sortKey: "tasks", dir: "desc", query: "recon" } },
  display: { agents: { layout: "list", density: "compact", visible: { usage: false } } },
};

describe("list prefs cookie codec", () => {
  it("round-trips prefs through serialize -> parse", () => {
    expect(parseListPrefs(serializeListPrefs(SAMPLE))).toEqual(SAMPLE);
  });

  it("produces a cookie-safe string (no raw delimiters)", () => {
    const encoded = serializeListPrefs(SAMPLE);
    expect(encoded).not.toMatch(/[;,\s"]/);
  });

  it("returns empty prefs for a missing cookie", () => {
    expect(parseListPrefs(undefined)).toEqual(EMPTY_LIST_PREFS);
  });

  it("returns empty prefs for a malformed cookie instead of throwing", () => {
    expect(parseListPrefs("not-json")).toEqual(EMPTY_LIST_PREFS);
    expect(parseListPrefs("%E0%A4%A")).toEqual(EMPTY_LIST_PREFS); // invalid percent-encoding
  });

  it("drops non-object query/display sections defensively", () => {
    const raw = serializeListPrefs({ query: 123, display: null } as unknown as ListPrefs);
    expect(parseListPrefs(raw)).toEqual({ query: {}, display: {} });
  });
});
