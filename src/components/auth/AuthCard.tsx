import type { ReactNode } from "react";
import { Brand } from "@/components/layout/Brand";

export function AuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Brand className="mb-8" />
      <div className="glass-panel w-full max-w-md p-6 md:p-8">
        <h1 className="font-serif text-2xl font-semibold text-civic-deep">{title}</h1>
        <p className="mt-1.5 text-sm text-ink/60">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-sm text-ink/65">{footer}</div>}
    </div>
  );
}
