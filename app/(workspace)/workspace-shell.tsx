"use client";

import { createContext, useContext, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { CommandMenu } from "@/components/organisms/command-menu";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { ShortcutsDialog } from "@/components/organisms/shortcuts-dialog";
import { ViewSkeleton } from "@/components/organisms/view-skeleton";
import { ViewTemplate } from "@/components/templates/view-template";
import { WorkspaceTemplate } from "@/components/templates/workspace-template";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { timeZoneCookie } from "@/lib/tasks/deadlines";
import { headingFor } from "@/lib/tasks/headings";
import { hrefFor, scopeFor } from "@/lib/tasks/routes";
import { viewTitles, type Overview, type Scope, type View } from "@/lib/tasks/types";
import { createListAction, deleteListAction } from "./actions";

// Sidebar numbers predicted by the open view while a change is on its way to the server.
type Prediction = Pick<Overview, "counts" | "lists">;

type Shell = {
  // The open view's quick add field, so search can focus it.
  quickAddRef: React.RefObject<HTMLInputElement | null>;
  // Call inside a transition; the prediction lasts until the transition ends.
  predict: (prediction: Prediction) => void;
};

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
  const [prediction, predict] = useOptimistic<Prediction | null, Prediction>(null, (_, next) => next);
  const [navigating, startNavigation] = useTransition();
  const [destination, setDestination] = useState<Scope | null>(null);
  const quickAddRef = useRef<HTMLInputElement>(null);

  const { counts, lists } = prediction ?? overview;
  const loading = navigating ? destination : null;
  const current = scopeFor(pathname);

  useTimeZoneCookie(router.refresh);

  // Navigates in a transition, so the shell knows when the next view has arrived.
  function navigate(href: string) {
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

  return (
    <ShellContext value={{ quickAddRef, predict }}>
      <WorkspaceTemplate
        sidebar={
          <AppSidebar
            counts={counts}
            lists={lists}
            scope={loading ?? current}
            pending={loading !== null}
            account={account}
            signOutAction={signOut}
            onSearch={() => setSearchOpen(true)}
            onShowShortcuts={() => setShortcutsOpen(true)}
            onNavigate={navigate}
            onCreateList={async (values) => {
              const result = await createListAction(values);
              if ("id" in result) navigate(hrefFor({ listId: result.id }));
              return result;
            }}
            onDeleteList={(listId) =>
              deleteListAction(listId, { leave: current !== null && "listId" in current && current.listId === listId })
            }
          />
        }
      >
        {loading ? (
          <ViewTemplate busy footer={<ShortcutBar />}>
            <ViewSkeleton heading={headingFor(loading, { lists, today })} />
          </ViewTemplate>
        ) : (
          children
        )}
      </WorkspaceTemplate>
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
