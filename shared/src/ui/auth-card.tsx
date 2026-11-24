import * as React from "react";

/** Centered card used by login, password and onboarding screens. */
export function AuthCard({ logo, title, description, children }: { logo: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-6">{logo}</div>
      <div className="w-full max-w-md rounded-card border-2 border-ink bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-black tracking-tight">{title}</h1>
        {description ? <p className="mt-2 text-sm text-steel">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
