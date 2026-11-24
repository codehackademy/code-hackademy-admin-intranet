"use client";

import * as React from "react";
import { Alert } from "./display.tsx";
import { Button } from "./button.tsx";
import { Field, Input, Select, Textarea } from "./form.tsx";

/** Result returned by every form server action. */
export type FormState = { ok?: boolean; message?: string; fieldErrors?: Record<string, string[]> } | null;

const Ctx = React.createContext<FormState>(null);
const useErr = (name: string) => React.useContext(Ctx)?.fieldErrors?.[name]?.[0];

/** First server-side error for a field, for custom controls inside an ActionForm. */
export const useFieldError = useErr;

type ActionFormProps = {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  children: React.ReactNode;
  className?: string;
};

/** A form bound to a server action with inline field errors and a status banner. */
export function ActionForm({ action, submitLabel, pendingLabel = "Saving…", children, className }: ActionFormProps) {
  const [state, formAction, pending] = React.useActionState(action, null);
  return (
    <form action={formAction} className={className ?? "space-y-5"} noValidate>
      <Ctx.Provider value={state}>
        {state?.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}
        {children}
      </Ctx.Provider>
      <Button type="submit" disabled={pending}>{pending ? pendingLabel : submitLabel}</Button>
    </form>
  );
}

type Common = { name: string; label: string; required?: boolean; hint?: string; className?: string };

function useProps(name: string) {
  const error = useErr(name);
  return { error, ctl: { id: name, name, "aria-describedby": `${name}-msg`, "aria-invalid": error ? true : undefined } as const };
}

export function FormInput({ name, label, required, hint, className, ...rest }: Common & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const { error, ctl } = useProps(name);
  return <Field label={label} htmlFor={name} required={required} hint={hint} error={error} className={className}><Input {...ctl} required={required} {...rest} /></Field>;
}

export function FormTextarea({ name, label, required, hint, className, ...rest }: Common & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const { error, ctl } = useProps(name);
  return <Field label={label} htmlFor={name} required={required} hint={hint} error={error} className={className}><Textarea {...ctl} required={required} {...rest} /></Field>;
}

export function FormSelect({ name, label, required, hint, className, options, placeholder = "Choose one", ...rest }: Common & { options: { value: string; label: string }[]; placeholder?: string } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  const { error, ctl } = useProps(name);
  return (
    <Field label={label} htmlFor={name} required={required} hint={hint} error={error} className={className}>
      <Select {...ctl} required={required} defaultValue="" {...rest}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    </Field>
  );
}

export function FormCheckbox({ name, children, required }: { name: string; children: React.ReactNode; required?: boolean }) {
  const error = useErr(name);
  return (
    <div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" id={name} name={name} required={required} aria-describedby={`${name}-msg`} aria-invalid={error ? true : undefined} className="mt-1 size-5 shrink-0 accent-orange" />
        <span>{children}</span>
      </label>
      <p id={`${name}-msg`} role={error ? "alert" : undefined} className="mt-1.5 text-xs font-semibold text-danger">{error}</p>
    </div>
  );
}
