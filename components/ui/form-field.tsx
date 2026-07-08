import type { ReactNode } from "react";
import { useId } from "react";
import { Label } from "./label";

// A labelled form field: pairs a token-styled Label with its control (via a render-prop
// that receives the generated id, so the association is real and getByLabelText works) and
// shows a validation message. Shared by every Phase 3 create/edit form.
export function FormField({
  label,
  error,
  labelClassName,
  children,
}: {
  label: string;
  error?: string;
  labelClassName?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      {children(id)}
      {error ? <p className="text-[12px] text-red">{error}</p> : null}
    </div>
  );
}
