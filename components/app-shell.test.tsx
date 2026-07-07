import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("shows the ATB product identity", () => {
    render(<AppShell>content</AppShell>);
    expect(screen.getByText(/ATB/i)).toBeInTheDocument();
  });

  it("hosts page content in a main landmark", () => {
    render(
      <AppShell>
        <p>hello world</p>
      </AppShell>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("hello world");
  });
});
