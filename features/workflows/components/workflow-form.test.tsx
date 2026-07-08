import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { WorkflowInput } from "../schema";
import { WorkflowForm } from "./workflow-form";

// Seam: the create/edit form (React Hook Form + Zod). Presentational — defaultValues in, a
// validated payload out; the step count is coerced to a number; invalid input blocks submit.

const filled: WorkflowInput = {
  name: "lint-sweep",
  description: "Enforce the lint ruleset repo-wide.",
  trigger: "schedule",
  triggerDetail: "0 6 * * 1",
  steps: 4,
};

describe("WorkflowForm", () => {
  it("prefills fields from defaultValues (edit mode)", () => {
    render(<WorkflowForm defaultValues={filled} submitLabel="Save" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue("lint-sweep");
    expect(screen.getByLabelText(/trigger$/i)).toHaveValue("schedule");
    expect(screen.getByLabelText(/steps/i)).toHaveValue(4);
  });

  it("submits the entered values with steps as a number", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WorkflowForm submitLabel="Create workflow" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "release-notes");
    await user.type(screen.getByLabelText(/description/i), "Draft release notes.");
    await user.selectOptions(screen.getByLabelText(/trigger$/i), "manual");
    await user.clear(screen.getByLabelText(/steps/i));
    await user.type(screen.getByLabelText(/steps/i), "2");
    await user.click(screen.getByRole("button", { name: /create workflow/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ name: "release-notes", steps: 2 });
  });

  it("blocks submission and shows an error when a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WorkflowForm submitLabel="Create workflow" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/description/i), "Some pipeline.");
    await user.click(screen.getByRole("button", { name: /create workflow/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
