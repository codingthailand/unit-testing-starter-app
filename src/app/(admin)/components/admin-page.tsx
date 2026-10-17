import type { ReactNode } from "react";

export function AdminPage({ title, description, actions, children }: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}
