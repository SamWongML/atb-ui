import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AgentInput } from "../schema";
import { AgentForm } from "./agent-form";

// Seam: the create/edit form (React Hook Form + Zod, TECH_STACK.md L8). Presentational —
// props are defaultValues + an onSubmit callback; the page wires the tRPC mutation. Tested
// through its public surface: prefilled values, a validated submit payload, and that
// invalid input blocks submission with a visible error.

const filled: AgentInput = {
  name: "Refactor Bot",
  role: "Builder",
  model: "Sonnet 4.5",
  description: "Applies scoped refactors.",
  systemPrompt: "You are a careful refactoring agent.",
  permissions: { edit: "allow", bash: "ask", network: "deny" },
  skills: ["code-review"],
  mcps: ["github"],
};

describe("AgentForm", () => {
  it("prefills fields from defaultValues (edit mode)", () => {
    render(<AgentForm defaultValues={filled} submitLabel="Save" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue("Refactor Bot");
    expect(screen.getByLabelText(/^model/i)).toHaveValue("Sonnet 4.5");
    expect(screen.getByLabelText(/edit permission/i)).toHaveValue("allow");
  });

  it("submits the entered values through onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AgentForm submitLabel="Create agent" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Recon");
    await user.type(screen.getByLabelText(/role/i), "Explorer");
    await user.selectOptions(screen.getByLabelText(/^model/i), "Haiku 4.5");
    await user.type(screen.getByLabelText(/description/i), "Maps the package.");
    await user.type(screen.getByLabelText(/system prompt/i), "You are Recon.");
    await user.selectOptions(screen.getByLabelText(/edit permission/i), "deny");
    await user.click(screen.getByRole("button", { name: /create agent/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: "Recon",
      role: "Explorer",
      model: "Haiku 4.5",
      permissions: { edit: "deny" },
    });
  });

  it("prefills and submits skills and MCP servers as arrays", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AgentForm defaultValues={filled} submitLabel="Save" onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/^skills/i)).toHaveValue("code-review");

    await user.clear(screen.getByLabelText(/mcp servers/i));
    await user.type(screen.getByLabelText(/mcp servers/i), "github, linear");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      skills: ["code-review"],
      mcps: ["github", "linear"],
    });
  });

  it("blocks submission and shows an error when a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AgentForm submitLabel="Create agent" onSubmit={onSubmit} />);

    // Name left blank.
    await user.type(screen.getByLabelText(/system prompt/i), "You are Recon.");
    await user.click(screen.getByRole("button", { name: /create agent/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
