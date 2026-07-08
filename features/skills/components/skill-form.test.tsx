import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SkillInput } from "../schema";
import { SkillForm } from "./skill-form";

// Seam: the create/edit form (React Hook Form + Zod). Presentational — defaultValues in, a
// validated payload out; invalid input blocks submission with an error.

const filled: SkillInput = {
  name: "Repo Map",
  category: "analysis",
  version: "v1.0",
  description: "Build a structural map of a codebase.",
  summary: "Maps entrypoints and cross-module usages.",
};

describe("SkillForm", () => {
  it("prefills fields from defaultValues (edit mode)", () => {
    render(<SkillForm defaultValues={filled} submitLabel="Save" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toHaveValue("Repo Map");
    expect(screen.getByLabelText(/category/i)).toHaveValue("analysis");
  });

  it("submits the entered values through onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SkillForm submitLabel="Create skill" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "SQL Migration");
    await user.selectOptions(screen.getByLabelText(/category/i), "data");
    await user.clear(screen.getByLabelText(/version/i));
    await user.type(screen.getByLabelText(/version/i), "v2.0");
    await user.type(screen.getByLabelText(/description/i), "Generate migrations.");
    await user.type(screen.getByLabelText(/summary/i), "Reversible migrations.");
    await user.click(screen.getByRole("button", { name: /create skill/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: "SQL Migration",
      category: "data",
      version: "v2.0",
    });
  });

  it("blocks submission and shows an error when a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SkillForm submitLabel="Create skill" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/summary/i), "A summary.");
    await user.click(screen.getByRole("button", { name: /create skill/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
