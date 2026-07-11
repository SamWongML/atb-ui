"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MCP_TRANSPORTS, type McpInput, mcpInputSchema } from "../schema";

// The MCP connect/edit form (React Hook Form + Zod). Presentational: validates against
// mcpInputSchema — the same schema the BFF router validates — and hands a valid payload to
// onSubmit. The page supplies onSubmit (the tRPC mutation) and, in edit mode, defaultValues.

const EMPTY: McpInput = { name: "", transport: "http", auth: "", description: "" };

export function McpForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending = false,
}: {
  defaultValues?: McpInput;
  onSubmit: (values: McpInput) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<McpInput>({
    resolver: zodResolver(mcpInputSchema),
    defaultValues: defaultValues ?? EMPTY,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <FormField label="Name" error={errors.name?.message}>
        {(id) => <Input id={id} aria-invalid={!!errors.name} {...register("name")} />}
      </FormField>

      <FormField label="Transport" error={errors.transport?.message}>
        {(id) => (
          <Select id={id} {...register("transport")}>
            {MCP_TRANSPORTS.map((transport) => (
              <option key={transport} value={transport}>
                {transport}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <FormField label="Auth" error={errors.auth?.message}>
        {(id) => <Input id={id} aria-invalid={!!errors.auth} {...register("auth")} />}
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

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
