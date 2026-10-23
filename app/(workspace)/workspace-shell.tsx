"use client";

import { createContext, useContext, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { MobileTopBar } from "@/components/molecules/mobile-top-bar";
import { PlannerTabs } from "@/components/molecules/planner-tabs";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { CommandMenu } from "@/components/organisms/command-menu";
import { ListNav } from "@/components/organisms/list-nav";
import { MobileTabBar, type MobileTab } from "@/components/organisms/mobile-tab-bar";
import { MoreMenu } from "@/components/organisms/more-menu";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { ShortcutsDialog } from "@/components/organisms/shortcuts-dialog";
import { ViewSkeleton } from "@/components/organisms/view-skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ViewTemplate } from "@/components/templates/view-template";
import { WorkspaceTemplate } from "@/components/templates/workspace-template";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { timeZoneCookie } from "@/lib/tasks/deadlines";
import { headingFor } from "@/lib/tasks/headings";
import { hrefFor, scopeFor } from "@/lib/tasks/routes";
import { plannerViews, viewTitles, type Overview, type Scope, type View } from "@/lib/tasks/types";
import { createListAction, deleteListAction } from "./actions";

// Sidebar numbers predicted by the open view while a change is on its way to the server.
type Prediction = Pick<Overview, "counts" | "lists">;

type Shell = {
  // The open view's quick add field, so search can focus it.
  quickAddRef: React.RefObject<HTMLInputElement | null>;
  // Call inside a transition; the prediction lasts until the transition ends.
  predict: (prediction: Prediction) => void;
  // Opens a view or list, showing it loading until it arrives.
  navigate: (href: string) => void;
};

// The drawers small screens open from the top bar and the tabs.
type MobileSheet = "menu" | "lists" | "more";

const ShellContext = createContext<Shell | null>(null);

// What every signed-in route shares: the sidebar, search, the shortcuts list and the shortcuts that work
// in any view. The layout renders it once, so it stays put while the user moves between views and lists.
// While the next view loads, it shows that view's heading over a skeleton of its tasks.
export function WorkspaceShell({
  overview,
  today,
  account,
  children,
}: {
  overview: Overview;
  today: string;
  account: React.ComponentProps<typeof AppSidebar>["account"];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sheet, setSheet] = useState<MobileSheet | null>(null);
  const [prediction, predict] = useOptimistic<Prediction | null, Prediction>(null, (_, next) => next);
  const [navigating, startNavigation] = useTransition();
  const [destination, setDestination] = useState<Scope | null>(null);
  const quickAddRef = useRef<HTMLInputElement>(null);

  const { counts, lists } = prediction ?? overview;
  const loading = navigating ? destination : null;
  const current = scopeFor(pathname);
  const shown = loading ?? current;

  useTimeZoneCookie(router.refresh);

  // Navigates in a transition, so the shell knows when the next view has arrived.
  function navigate(href: string) {
    setSheet(null);
    setDestination(scopeFor(new URL(href, window.location.href).pathname));
    startNavigation(() => router.push(href));
  }

  useShortcuts({
    "?": () => setShortcutsOpen(true),
    "mod+k": () => setSearchOpen(true),
    ...Object.fromEntries(
      (Object.keys(viewTitles) as View[]).map((view, index) => [String(index + 1), () => navigate(hrefFor({ view }))]),
    ),
  });

  function showSearch() {
    setSheet(null);
    setSearchOpen(true);
  }

  function showShortcuts() {
    setSheet(null);
    setShortcutsOpen(true);
  }

  const listProps = {
    lists,
    scope: shown,
    pending: loading !== null,
    onNavigate: navigate,
    onCreateList: async (values: { name: string }) => {
      const result = await createListAction(values);
      if ("id" in result) navigate(hrefFor({ listId: result.id }));
      return result;
    },
    onDeleteList: (listId: string) =>
      deleteListAction(listId, { leave: current !== null && "listId" in current && current.listId === listId }),
  };

  const sidebar = (
    <AppSidebar
      {...listProps}
      counts={counts}
      account={account}
      signOutAction={signOut}
      onSearch={showSearch}
      onShowShortcuts={showShortcuts}
    />
  );

  return (
    <ShellContext value={{ quickAddRef, predict, navigate }}>
      <WorkspaceTemplate
        sidebar={sidebar}
        header={<MobileTopBar onOpenMenu={() => setSheet("menu")} onSearch={showSearch} />}
        tabBar={
          <MobileTabBar
            active={tabFor(shown)}
            onNavigate={navigate}
            onShowLists={() => setSheet("lists")}
            onShowMore={() => setSheet("more")}
          />
        }
      >
        {loading ? (
          <ViewTemplate busy footer={<ShortcutBar />}>
            <ViewSkeleton
              heading={headingFor(loading, { lists, today })}
              tabs={
                tabFor(loading) === "planner" && (
                  <PlannerTabs
                    className="md:hidden"
                    counts={counts}
                    active={"view" in loading ? loading.view : null}
                    pending
                  />
                )
              }
            />
          </ViewTemplate>
        ) : (
          children
        )}
      </WorkspaceTemplate>
      <Sheet open={sheet === "menu"} onOpenChange={(open) => setSheet(open ? "menu" : null)}>
        <SheetContent side="left" showCloseButton={false} className="w-72 bg-sidebar">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
      <Sheet open={sheet === "lists"} onOpenChange={(open) => setSheet(open ? "lists" : null)}>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Lists</SheetTitle>
          </SheetHeader>
          <div className="px-2 pb-4">
            <ListNav {...listProps} />
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={sheet === "more"} onOpenChange={(open) => setSheet(open ? "more" : null)}>
        <SheetContent side="bottom" className="pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="px-2 pb-4">
            <MoreMenu
              account={account}
              signOutAction={signOut}
              onSearch={showSearch}
              onShowShortcuts={showShortcuts}
            />
          </div>
        </SheetContent>
      </Sheet>
      <CommandMenu
        open={searchOpen}
        onOpenChange={setSearchOpen}
        lists={lists}
        searchable={overview.searchable}
        onNavigate={navigate}
        onNewTask={() => quickAddRef.current?.focus()}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </ShellContext>
  );
}

export function useWorkspaceShell(): Shell {
  const shell = useContext(ShellContext);
  if (!shell) throw new Error("useWorkspaceShell must be used inside WorkspaceShell");
  return shell;
}

// The server works out "today" from this cookie, so keep it in sync with the browser's time zone.
function useTimeZoneCookie(refresh: () => void) {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cookie = `${timeZoneCookie}=${timeZone}`;
    if (!document.cookie.split("; ").includes(cookie)) {
      document.cookie = `${cookie}; path=/; max-age=31536000; samesite=lax`;
      refresh();
    }
  }, [refresh]);
}

// The tab a view or list belongs to on small screens.
function tabFor(scope: Scope | null): MobileTab | null {
  if (!scope) return null;
  if ("listId" in scope) return "lists";
  return (plannerViews as readonly View[]).includes(scope.view) ? "planner" : "inbox";
}
