import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn.ts";

const badge = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", {
  variants: {
    tone: {
      neutral: "bg-ink/8 text-ink",
      brand: "bg-orange-soft text-orange-deep",
      success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning",
      danger: "bg-danger-soft text-danger",
      info: "bg-info-soft text-info",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...p} />;
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-line bg-white p-5 shadow-card sm:p-6", className)} {...p} />;
}

const alert = cva("rounded-ui border-2 px-4 py-3 text-sm", {
  variants: {
    tone: {
      info: "border-info bg-info-soft text-info",
      success: "border-success bg-success-soft text-success",
      warning: "border-warning bg-warning-soft text-warning",
      danger: "border-danger bg-danger-soft text-danger",
    },
  },
  defaultVariants: { tone: "info" },
});

export function Alert({ className, tone, ...p }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alert>) {
  return <div role={tone === "danger" ? "alert" : "status"} className={cn(alert({ tone }), className)} {...p} />;
}

/** Empty state: always say what is missing and what to do next. */
export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-card border-2 border-dashed border-line px-6 py-10 text-center">
      <p className="font-display text-lg font-extrabold">{title}</p>
      {children ? <p className="mx-auto mt-2 max-w-md text-sm text-steel">{children}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-steel">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
