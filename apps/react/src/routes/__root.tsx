import { useState } from "react";
import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { Monitor } from "lucide-react";
import { getAppFullVersion } from "@/util/configUtils.ts";
import { ModalHost } from "@/components/ModalHost.tsx";
import { SaveDraftButton } from "@/components/SaveDraftButton.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { AppBarSlotContext } from "@/components/AppBarSlot.tsx";
import logoUrl from "@/assets/img/logo.svg";

export const Route = createRootRoute({
  component: RootLayout,
});

const NAV_LINK =
  "text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground";

function RootLayout() {
  // Editorn låser scrollen (app-shell) och fyller appbaren via slot:en; övriga
  // rutter flödar och scrollar i main. Startsidan visas utan header/footer (ren
  // landningssida); editorn och övriga sidor har en footer i botten.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isEditor = pathname.startsWith("/redigera");
  const isHome = pathname === "/";
  // Informationssidorna (om Gredor, integritetspolicy) visar ingen
  // Start/Redigera-navigering i headern.
  const isInfoPage =
    pathname === "/om-gredor" || pathname === "/integritetspolicy";
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Mobilnotis: verktyget är byggt för större skärmar. */}
      <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-warning/15 px-4 py-2 text-center text-sm text-ink md:hidden">
        <Monitor className="size-4 shrink-0 text-[#b57f19]" />
        Gredor är utformat för datorer – använd gärna en större skärm.
      </div>
      {!isHome && (
        <header className="z-20 flex h-14 shrink-0 items-center gap-6 border-b bg-card px-4">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src={logoUrl}
              alt="Gredor – gratis årsredovisning"
              className="h-7 w-auto"
            />
          </Link>
          {isEditor ? (
            <>
              <div
                ref={setSlotEl}
                className="flex min-w-0 flex-1 items-center gap-3"
              />
              <div className="shrink-0">
                <SaveDraftButton />
              </div>
            </>
          ) : (
            <>
              {!isInfoPage && (
                <nav className="flex items-center gap-5">
                  <Link
                    to="/"
                    className={NAV_LINK}
                    activeOptions={{ exact: true }}
                  >
                    Start
                  </Link>
                  <Link to="/redigera" className={NAV_LINK}>
                    Redigera
                  </Link>
                </nav>
              )}
              <div className="ml-auto text-xs text-muted-foreground">
                {getAppFullVersion()}
              </div>
            </>
          )}
        </header>
      )}

      {isEditor ? (
        <>
          <main className="min-h-0 flex-1 overflow-hidden">
            <AppBarSlotContext.Provider value={slotEl}>
              <Outlet />
            </AppBarSlotContext.Provider>
          </main>
          <SiteFooter />
        </>
      ) : isHome ? (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            <SiteFooter />
          </div>
        </main>
      )}

      {/* Globala värdar: kö-lagda meddelandemodaler + toaster. */}
      <ModalHost />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

/** Delad footer: länkar + version. Fäst i botten på editorn och övriga sidor. */
function SiteFooter() {
  return (
    <footer className="shrink-0 border-t bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Link to="/om-gredor" className="hover:text-foreground">
            Om Gredor
          </Link>
          <Link to="/integritetspolicy" className="hover:text-foreground">
            Integritetspolicy
          </Link>
        </div>
        <div className="opacity-75">Version: {getAppFullVersion()}</div>
      </div>
    </footer>
  );
}
