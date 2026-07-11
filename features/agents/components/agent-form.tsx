"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ListInput } from "@/components/ui/list-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AGENT_MODELS, AGENT_PERMISSIONS, type AgentInput, agentInputSchema } from "../schema";

// The agent create/edit form (React Hook Form + Zod, TECH_STACK.md L8). Presentational:
// it owns validation against agentInputSchema — the same schema the BFF router validates —
// and hands a valid payload to onSubmit. The page supplies onSubmit (the tRPC mutation)
// and, in edit mode, defaultValues. Invalid input never reaches onSubmit.

const EMPTY: AgentInput = {
  name: "",
  role: "",
  model: "Sonnet 4.5",
  description: "",
  systemPrompt: "",
  permissions: { edit: "ask", bash: "ask", network: "ask" },
  skills: [],
  mcps: [],
};

export function AgentForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending = false,
}: {
  defaultValues?: AgentInput;
  onSubmit: (values: AgentInput) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentInput>({
    resolver: zodResolver(agentInputSchema),
    defaultValues: defaultValues ?? EMPTY,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <FormField label="Name" error={errors.name?.message}>
        {(id) => <Input id={id} aria-invalid={!!errors.name} {...register("name")} />}
      </FormField>

      <FormField label="Role" error={errors.role?.message}>
        {(id) => <Input id={id} aria-invalid={!!errors.role} {...register("role")} />}
      </FormField>

      <FormField label="Model" error={errors.model?.message}>
        {(id) => (
          <Select id={id} {...register("model")}>
            {AGENT_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        )}
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

      <FormField label="System prompt" error={errors.systemPrompt?.message}>
        {(id) => (
          <Textarea
            id={id}
            rows={6}
            className="font-mono text-[12px]"
            aria-invalid={!!errors.systemPrompt}
            {...register("systemPrompt")}
          />
        )}
      </FormField>

      <fieldset className="space-y-2.5">
        <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
          Permissions
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["edit", "bash", "network"] as const).map((key) => (
            <FormField key={key} label={`${key} permission`} labelClassName="capitalize">
              {(id) => (
                <Select id={id} {...register(`permissions.${key}`)}>
                  {AGENT_PERMISSIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Skills" error={errors.skills?.message}>
          {(id) => (
            <ListInput
              id={id}
              control={control}
              name="skills"
              placeholder="comma-separated skill ids"
            />
          )}
        </FormField>

        <FormField label="MCP servers" error={errors.mcps?.message}>
          {(id) => (
            <ListInput
              id={id}
              control={control}
              name="mcps"
              placeholder="comma-separated server names"
            />
          )}
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
