import type React from "react";
interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={`flex flex-col ${className || ""}`}>
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-xl grid gap-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
