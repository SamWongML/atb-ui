"use client";

import { useState } from "react";
import { type Control, type FieldPath, type FieldValues, useController } from "react-hook-form";
import { Input } from "./input";

/** Split a comma-separated string into trimmed, non-empty tokens. */
export function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// A text control for a `string[]` form field: the user edits comma-separated text while the
// registered form value stays the parsed array its schema validates — one contract, both sides.
// Shared by the Phase 3 forms whose rosters are lists of short identifiers (agent skills/MCPs,
// squad members). The raw text is held locally so separators survive typing; only the parsed
// array is pushed to the form. Seeded once from the field's default (edit-mode values).
export function ListInput<T extends FieldValues>({
  id,
  control,
  name,
  placeholder,
}: {
  id?: string;
  control: Control<T>;
  name: FieldPath<T>;
  placeholder?: string;
}) {
  const { field } = useController({ control, name });
  const [text, setText] = useState(() => (field.value as string[]).join(", "));
  return (
    <Input
      id={id}
      placeholder={placeholder}
      name={field.name}
      ref={field.ref}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        field.onChange(parseList(event.target.value));
      }}
      onBlur={field.onBlur}
    />
  );
}
