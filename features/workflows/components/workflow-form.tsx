"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WORKFLOW_TRIGGERS, type WorkflowInput, workflowInputSchema } from "../schema";

// The workflow create/edit form (React Hook Form + Zod). Presentational: validates against
// workflowInputSchema — the same schema the BFF router validates — and hands a valid payload
// to onSubmit. The step count is registered valueAsNumber so it reaches the schema as a
// number. The page supplies onSubmit (the tRPC mutation) and, in edit mode, defaults.

const EMPTY: WorkflowInput = {
  name: "",
  description: "",
  trigger: "manual",
  triggerDetail: "",
  steps: 1,
};

export function WorkflowForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending = false,
}: {
  defaultValues?: WorkflowInput;
  onSubmit: (values: WorkflowInput) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkflowInput>({
    resolver: zodResolver(workflowInputSchema),
    defaultValues: defaultValues ?? EMPTY,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-2xl flex-col gap-5"
      noValidate
    >
      <FormField label="Name" error={errors.name?.message}>
        {(id) => <Input id={id} aria-invalid={!!errors.name} {...register("name")} />}
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        {(id) => (
          <Textarea
            id={id}
            rows={2}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Trigger" error={errors.trigger?.message}>
          {(id) => (
            <Select id={id} {...register("trigger")}>
              {WORKFLOW_TRIGGERS.map((trigger) => (
                <option key={trigger} value={trigger}>
                  {trigger}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Steps" error={errors.steps?.message}>
          {(id) => (
            <Input
              id={id}
              type="number"
              min={1}
              aria-invalid={!!errors.steps}
              {...register("steps", { valueAsNumber: true })}
            />
          )}
        </FormField>
      </div>

      <FormField label="Trigger detail" error={errors.triggerDetail?.message}>
        {(id) => (
          <Input id={id} placeholder="cron string, PR glob, …" {...register("triggerDetail")} />
        )}
      </FormField>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
