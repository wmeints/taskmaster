import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { TaskDetailEmpty } from "@/components/molecules/task-detail-empty";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { ViewSkeleton } from "@/components/organisms/view-skeleton";
import { ViewTemplate } from "@/components/templates/view-template";
import { WorkspaceTemplate } from "@/components/templates/workspace-template";
import { getCurrentAccount } from "@/lib/accounts";
import { getOverview } from "@/lib/tasks";
import { getToday } from "./today";
import { WorkspaceShell } from "./workspace-shell";

// Shared by every view and list route. Layouts stay mounted during navigation, so the sidebar doesn't
// flicker. The fallback only shows on the first load: after that the shell shows its own loading state
// while the next view renders.
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <WorkspaceTemplate sidebar={null}>
          <ViewTemplate busy footer={<ShortcutBar />} emptyDetail={<TaskDetailEmpty />}>
            <ViewSkeleton heading={null} />
          </ViewTemplate>
        </WorkspaceTemplate>
      }
    >
      <Workspace>{children}</Workspace>
    </Suspense>
  );
}

async function Workspace({ children }: { children: React.ReactNode }) {
  // Defer to request time so prerendering stops here instead of inside the auth SDK.
  await connection();
  const account = await getCurrentAccount();
  if (!account) {
    redirect("/auth/sign-in");
  }

  const today = await getToday();
  const overview = await getOverview(account.id, today);
  return (
    <WorkspaceShell
      overview={overview}
      today={today}
      account={{ name: account.name, email: account.email, createdAt: account.createdAt }}
    >
      {children}
    </WorkspaceShell>
  );
}
