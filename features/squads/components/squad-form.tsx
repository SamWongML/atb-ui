"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ListInput } from "@/components/ui/list-input";
import { Textarea } from "@/components/ui/textarea";
import { type SquadInput, squadInputSchema } from "../schema";

// The squad create/edit form (React Hook Form + Zod). Presentational: validates against
// squadInputSchema — the same schema the BFF router validates — and hands a valid payload
// to onSubmit. The step count is registered valueAsNumber so it reaches the schema as a
// number. The page supplies onSubmit (the tRPC mutation) and, in edit mode, defaults.

const EMPTY: SquadInput = {
  name: "",
  mission: "",
  repo: "",
  lead: "",
  phase: "",
  stepsTotal: 1,
  members: [],
};

export function SquadForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending = false,
}: {
  defaultValues?: SquadInput;
  onSubmit: (values: SquadInput) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SquadInput>({
    resolver: zodResolver(squadInputSchema),
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

      <FormField label="Mission" error={errors.mission?.message}>
        {(id) => (
          <Textarea id={id} rows={2} aria-invalid={!!errors.mission} {...register("mission")} />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Target repo" error={errors.repo?.message}>
          {(id) => <Input id={id} aria-invalid={!!errors.repo} {...register("repo")} />}
        </FormField>

        <FormField label="Lead (agent mono)" error={errors.lead?.message}>
          {(id) => <Input id={id} aria-invalid={!!errors.lead} {...register("lead")} />}
        </FormField>

        <FormField label="Phase" error={errors.phase?.message}>
          {(id) => <Input id={id} aria-invalid={!!errors.phase} {...register("phase")} />}
        </FormField>

        <FormField label="Total steps" error={errors.stepsTotal?.message}>
          {(id) => (
            <Input
              id={id}
              type="number"
              min={1}
              aria-invalid={!!errors.stepsTotal}
              {...register("stepsTotal", { valueAsNumber: true })}
            />
          )}
        </FormField>
      </div>

      <FormField label="Members (agent monos)" error={errors.members?.message}>
        {(id) => (
          <ListInput
            id={id}
            control={control}
            name="members"
            placeholder="comma-separated agent monos"
          />
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
