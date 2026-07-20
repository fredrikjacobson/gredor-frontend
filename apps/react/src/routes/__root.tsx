import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { getAppFullVersion } from "@/util/configUtils.ts";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-semibold text-primary">
            Gredor
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-ink-medium hover:text-primary [&.active]:text-primary [&.active]:font-medium"
              activeOptions={{ exact: true }}
            >
              Start
            </Link>
            <Link
              to="/redigera"
              className="text-ink-medium hover:text-primary [&.active]:text-primary [&.active]:font-medium"
            >
              Redigera
            </Link>
            <Link
              to="/om-gredor"
              className="text-ink-medium hover:text-primary [&.active]:text-primary [&.active]:font-medium"
            >
              Om Gredor
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface-dark">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-ink-medium">
          <div className="flex gap-4">
            <Link to="/om-gredor" className="hover:text-primary">
              Om Gredor
            </Link>
            <Link to="/integritetspolicy" className="hover:text-primary">
              Integritetspolicy
            </Link>
          </div>
          <div className="opacity-75">Version: {getAppFullVersion()}</div>
        </div>
      </footer>
    </div>
  );
}
