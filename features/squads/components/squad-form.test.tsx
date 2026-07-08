import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SquadInput } from "../schema";
import { SquadForm } from "./squad-form";

// Seam: the create/edit form (React Hook Form + Zod). Presentational — defaultValues in, a
// validated payload out; the step count is coerced to a number; invalid input blocks submit.

const filled: SquadInput = {
  name: "Auth Migration Squad",
  mission: "Migrate auth module",
  repo: "meridian/api",
  lead: "OR",
  phase: "Verify",
  stepsTotal: 5,
  members: ["BD", "SR"],
};

describe("SquadForm", () => {
  it("prefills fields from defaultValues (edit mode)", () => {
    render(<SquadForm defaultValues={filled} submitLabel="Save" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue("Auth Migration Squad");
    expect(screen.getByLabelText(/target repo/i)).toHaveValue("meridian/api");
    expect(screen.getByLabelText(/total steps/i)).toHaveValue(5);
  });

  it("submits the entered values with stepsTotal as a number", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SquadForm submitLabel="Create squad" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Search Squad");
    await user.type(screen.getByLabelText(/mission/i), "Move to OpenSearch");
    await user.type(screen.getByLabelText(/target repo/i), "meridian/data");
    await user.type(screen.getByLabelText(/lead/i), "OR");
    await user.type(screen.getByLabelText(/phase/i), "Plan");
    await user.clear(screen.getByLabelText(/total steps/i));
    await user.type(screen.getByLabelText(/total steps/i), "6");
    await user.click(screen.getByRole("button", { name: /create squad/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ name: "Search Squad", stepsTotal: 6 });
  });

  it("prefills and submits the member roster as an array", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SquadForm defaultValues={filled} submitLabel="Save" onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/members/i)).toHaveValue("BD, SR");

    await user.clear(screen.getByLabelText(/members/i));
    await user.type(screen.getByLabelText(/members/i), "BD, TR");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ members: ["BD", "TR"] });
  });

  it("blocks submission and shows an error when a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SquadForm submitLabel="Create squad" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/mission/i), "A mission.");
    await user.click(screen.getByRole("button", { name: /create squad/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
