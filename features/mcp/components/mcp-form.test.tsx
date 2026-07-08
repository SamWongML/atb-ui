import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { McpInput } from "../schema";
import { McpForm } from "./mcp-form";

// Seam: the connect/edit form (React Hook Form + Zod). Presentational — defaultValues in,
// a validated payload out through onSubmit; invalid input blocks submission with an error.

const filled: McpInput = {
  name: "grafana",
  transport: "http",
  auth: "API key",
  description: "Dashboards and alerts.",
};

describe("McpForm", () => {
  it("prefills fields from defaultValues (edit mode)", () => {
    render(<McpForm defaultValues={filled} submitLabel="Save" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue("grafana");
    expect(screen.getByLabelText(/transport/i)).toHaveValue("http");
  });

  it("submits the entered values through onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<McpForm submitLabel="Connect server" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "postgres-ro");
    await user.selectOptions(screen.getByLabelText(/transport/i), "stdio");
    await user.type(screen.getByLabelText(/auth/i), "DSN");
    await user.type(screen.getByLabelText(/description/i), "Read replica.");
    await user.click(screen.getByRole("button", { name: /connect server/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: "postgres-ro",
      transport: "stdio",
      auth: "DSN",
    });
  });

  it("blocks submission and shows an error when a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<McpForm submitLabel="Connect server" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/auth/i), "Bot token");
    await user.click(screen.getByRole("button", { name: /connect server/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
