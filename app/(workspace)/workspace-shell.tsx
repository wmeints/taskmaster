"use client";

import { createContext, useContext, useEffect, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { MobileTopBar } from "@/components/molecules/mobile-top-bar";
import { PlannerTabs } from "@/components/molecules/planner-tabs";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { CommandMenu } from "@/components/organisms/command-menu";
import { ListNav } from "@/components/organisms/list-nav";
import { MobileTabBar, type MobileTab } from "@/components/organisms/mobile-tab-bar";
import { MoreMenu } from "@/components/organisms/more-menu";
import { ShareListDialog } from "@/components/organisms/share-list-dialog";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { ShortcutsDialog } from "@/components/organisms/shortcuts-dialog";
import { ViewSkeleton } from "@/components/organisms/view-skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ViewTemplate } from "@/components/templates/view-template";
import { WorkspaceTemplate } from "@/components/templates/workspace-template";
import { useShortcuts } from "@/hooks/use-shortcuts";
import type { Sharing } from "@/lib/sharing/types";
import { timeZoneCookie } from "@/lib/tasks/deadlines";
import { headingFor } from "@/lib/tasks/headings";
import { hrefFor, scopeFor } from "@/lib/tasks/routes";
import { plannerViews, viewTitles, type Overview, type Scope, type View } from "@/lib/tasks/types";
import {
  createListAction,
  deleteListAction,
  inviteToListAction,
  leaveListAction,
  quickAddTaskAction,
  removeMemberAction,
  resendInviteAction,
  respondToInvitationAction,
  revokeInviteAction,
} from "./actions";

// Sidebar numbers predicted by the open view while a change is on its way to the server.
type Prediction = Pick<Overview, "counts" | "lists">;

type Shell = {
  // Call inside a transition; the prediction lasts until the transition ends.
  predict: (prediction: Prediction) => void;
  // Opens a view or list, showing it loading until it arrives.
  navigate: (href: string) => void;
};

// The drawers small screens open from the top bar and the tabs.
type MobileSheet = "menu" | "lists" | "more";

const ShellContext = createContext<Shell | null>(null);

// What every signed-in route shares: the sidebar, search, the shortcuts list, sharing lists and the
// shortcuts that work in any view. The layout renders it once, so it stays put while the user moves between views and lists.
// While the next view loads, it shows that view's heading over a skeleton of its tasks.
export function WorkspaceShell({
  overview,
  today,
  account,
  sharing,
  children,
}: {
  overview: Overview;
  today: string;
  account: React.ComponentProps<typeof AppSidebar>["account"];
  sharing: Sharing;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sheet, setSheet] = useState<MobileSheet | null>(null);
  // The list whose share dialog is open; it outlives shareOpen so the dialog keeps its content while closing.
  const [shareListId, setShareListId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [prediction, predict] = useOptimistic<Prediction | null, Prediction>(null, (_, next) => next);
  const [navigating, startNavigation] = useTransition();
  const [destination, setDestination] = useState<Scope | null>(null);

  const { counts, lists } = prediction ?? overview;
  const loading = navigating ? destination : null;
  const current = scopeFor(pathname);
  const shown = loading ?? current;
  const sharedList = lists.find((list) => list.id === shareListId && list.owned);

  useTimeZoneCookie(router.refresh);

  // Navigates in a transition, so the shell knows when the next view has arrived.
  function navigate(href: string) {
    setSheet(null);
    setDestination(scopeFor(new URL(href, window.location.href).pathname));
    startNavigation(() => router.push(href));
  }

  function share(listId: string) {
    setSheet(null);
    setShareListId(listId);
    setShareOpen(true);
  }

  useShortcuts({
    "?": () => setShortcutsOpen(true),
    "shift+s": () => {
      const list = current && "listId" in current && lists.find((l) => l.id === current.listId);
      if (list && list.owned) share(list.id);
    },
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

  const viewing = (listId: string) => current !== null && "listId" in current && current.listId === listId;

  const listProps = {
    lists,
    invitations: sharing.invitations,
    scope: shown,
    pending: loading !== null,
    onNavigate: navigate,
    onCreateList: async (values: { name: string }) => {
      const result = await createListAction(values);
      if ("id" in result) navigate(hrefFor({ listId: result.id }));
      return result;
    },
    onShareList: share,
    onDeleteList: (listId: string) => deleteListAction(listId, { leave: viewing(listId) }),
    onLeaveList: (listId: string) => leaveListAction(listId, { leave: viewing(listId) }),
    onRespondToInvitation: (inviteId: string, accept: boolean) => respondToInvitationAction(inviteId, { accept }),
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
    <ShellContext value={{ predict, navigate }}>
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
        today={today}
        onNavigate={navigate}
        onShowShortcuts={() => setShortcutsOpen(true)}
        onAddTask={quickAddTaskAction}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      {sharedList && (
        <ShareListDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          listName={sharedList.name}
          owner={account}
          access={sharing.lists[sharedList.id] ?? { members: [], invites: [] }}
          onInvite={(values) => inviteToListAction(sharedList.id, values)}
          onResend={resendInviteAction}
          onRevoke={revokeInviteAction}
          onRemove={(memberId) => removeMemberAction(sharedList.id, memberId)}
        />
      )}
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
