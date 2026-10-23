import { WorkspacePage } from "../../workspace-page";

// Navigation waits for this view on the server while the (workspace) shell shows a loading state of its
// own, so the page doesn't need an instant Suspense fallback.
export const instant = false;

export default function ListPage({ params, searchParams }: PageProps<"/lists/[listId]">) {
  return <WorkspacePage scope={params.then(({ listId }) => ({ listId }))} searchParams={searchParams} />;
}
