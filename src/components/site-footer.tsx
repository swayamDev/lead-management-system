import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Rendered on every page from the root layout - the live-build
 * requirement is a *visible* credit line, so this can't be buried
 * inside just the dashboard or just the public form.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto flex items-center justify-between gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
      <a
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Built for Digital Heroes Training Task
      </a>
      <ThemeToggle />
    </footer>
  );
}
