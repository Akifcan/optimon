export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex h-12 max-w-5xl flex-col items-center justify-center gap-1 px-4 text-xs text-muted-foreground sm:h-14 sm:flex-row sm:justify-between sm:text-sm">
        <span>Optimon Dashboard</span>
        <span className="hidden sm:inline">Vault Optimizer Monitor</span>
      </div>
    </footer>
  );
}
