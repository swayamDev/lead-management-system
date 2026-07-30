import { ThemeToggle } from "@/components/theme-toggle";

// Rendered on every page from the root layout since the credit line
// needs to be visible everywhere, not just the dashboard or public form.
export function SiteFooter() {
  return (
    <footer className="text-muted-foreground mt-auto flex items-center justify-evenly gap-4 border-t px-4 py-3 text-xs">
      <ThemeToggle />
      <a
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        Built for Digital Heroes Training Task
      </a>
    </footer>
  );
}
