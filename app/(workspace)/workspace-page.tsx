import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/accounts";
import { getWorkspace } from "@/lib/tasks";
import { hrefFor } from "@/lib/tasks/routes";
import type { Scope } from "@/lib/tasks/types";
import { getToday } from "./today";
import { WorkspaceScreen } from "./workspace-screen";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Shared by every view and list route: loads the signed-in user's workspace for the scope. Renders
// inside the (workspace) layout, which provides the sidebar and the loading states.
export async function WorkspacePage({ scope, searchParams }: { scope: Scope | Promise<Scope>; searchParams: SearchParams }) {
  // Defer to request time so prerendering stops here instead of inside the auth SDK.
  await connection();
  // Layouts don't re-render on navigation, so each page checks the session itself.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const [resolvedScope, { task }, today] = await Promise.all([scope, searchParams, getToday()]);
  const workspace = await getWorkspace(user.id, resolvedScope, today);
  if (!workspace) {
    notFound();
  }

  const initialTaskId = typeof task === "string" ? task : undefined;
  return (
    <WorkspaceScreen
      // Start fresh (selection, open panel) whenever navigation lands on another view or task.
      key={hrefFor(resolvedScope, initialTaskId)}
      workspace={workspace}
      initialTaskId={initialTaskId}
    />
  );
}
