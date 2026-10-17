import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

/** ช่องฟอร์มที่แสดง error จาก server (fieldErrors ของ ActionState) */
export function FormField({ name, label, errors, description, children }: {
  name: string;
  label: string;
  errors?: Record<string, string[]>;
  description?: string;
  children: ReactNode;
}) {
  const messages = errors?.[name];
  return (
    <Field data-invalid={Boolean(messages)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {messages && <FieldError data-testid={`error-${name}`} errors={messages.map((message) => ({ message }))} />}
    </Field>
  );
}

export const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";
