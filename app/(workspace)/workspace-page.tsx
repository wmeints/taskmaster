import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { WorkspaceTemplate } from "@/components/templates/workspace-template";
import { getCurrentAccount } from "@/lib/accounts";
import { getWorkspace } from "@/lib/tasks";
import { hrefFor } from "@/lib/tasks/routes";
import type { Scope } from "@/lib/tasks/types";
import { getToday } from "./today";
import { WorkspaceScreen } from "./workspace-screen";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Shared by every view and list route: loads the signed-in user's workspace for the scope.
export function WorkspacePage({ scope, searchParams }: { scope: Scope | Promise<Scope>; searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <WorkspaceTemplate sidebar={null} footer={<ShortcutBar />}>
          <p className="text-sm text-muted-foreground">Loading your tasks…</p>
        </WorkspaceTemplate>
      }
    >
      <Workspace scope={scope} searchParams={searchParams} />
    </Suspense>
  );
}

async function Workspace({ scope, searchParams }: { scope: Scope | Promise<Scope>; searchParams: SearchParams }) {
  // Defer to request time so prerendering stops here instead of inside the auth SDK.
  await connection();
  const account = await getCurrentAccount();
  if (!account) {
    redirect("/auth/sign-in");
  }

  const [resolvedScope, { task }, today] = await Promise.all([scope, searchParams, getToday()]);
  const workspace = await getWorkspace(account.id, resolvedScope, today);
  if (!workspace) {
    notFound();
  }

  const initialTaskId = typeof task === "string" ? task : undefined;
  return (
    <WorkspaceScreen
      // Start fresh (selection, open panel) whenever navigation lands on another view or task.
      key={hrefFor(resolvedScope, initialTaskId)}
      workspace={workspace}
      account={{ name: account.name, email: account.email, createdAt: account.createdAt }}
      initialTaskId={initialTaskId}
    />
  );
}
