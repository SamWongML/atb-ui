"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_CATEGORIES, type SkillInput, skillInputSchema } from "../schema";

// The skill create/edit form (React Hook Form + Zod). Presentational: validates against
// skillInputSchema — the same schema the BFF router validates — and hands a valid payload
// to onSubmit. The page supplies onSubmit (the tRPC mutation) and, in edit mode, defaults.

const EMPTY: SkillInput = {
  name: "",
  category: "testing",
  version: "v1.0",
  description: "",
  summary: "",
};

export function SkillForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending = false,
}: {
  defaultValues?: SkillInput;
  onSubmit: (values: SkillInput) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillInput>({
    resolver: zodResolver(skillInputSchema),
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

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Category" error={errors.category?.message}>
          {(id) => (
            <Select id={id} {...register("category")}>
              {SKILL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Version" error={errors.version?.message}>
          {(id) => <Input id={id} aria-invalid={!!errors.version} {...register("version")} />}
        </FormField>
      </div>

      <FormField label="Description" error={errors.description?.message}>
        {(id) => <Input id={id} aria-invalid={!!errors.description} {...register("description")} />}
      </FormField>

      <FormField label="Summary" error={errors.summary?.message}>
        {(id) => (
          <Textarea id={id} rows={3} aria-invalid={!!errors.summary} {...register("summary")} />
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
