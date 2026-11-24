import * as React from "react";
import { cn } from "./cn.ts";

const control =
  "block w-full rounded-ui border-2 border-ink/80 bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-steel/80 disabled:bg-ink/5 aria-[invalid=true]:border-danger sm:text-sm";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(control, "min-h-11", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(control, "min-h-28", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, ref) => (
  <select ref={ref} className={cn(control, "min-h-11", className)} {...p} />
));
Select.displayName = "Select";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Label + control + hint + error with correct ids for assistive tech. Give the control `aria-describedby={`${htmlFor}-msg`}`. */
export function Field({ label, htmlFor, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-bold">
        {label}
        {required ? <span aria-hidden className="text-orange-deep"> *</span> : <span className="font-normal text-steel"> (optional)</span>}
      </label>
      {children}
      <p id={`${htmlFor}-msg`} className={cn("text-xs", error ? "font-semibold text-danger" : "text-steel")} role={error ? "alert" : undefined}>
        {error ?? hint}
      </p>
    </div>
  );
}
