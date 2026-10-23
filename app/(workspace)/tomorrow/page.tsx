import type { Metadata } from "next";
import { WorkspacePage } from "../workspace-page";

// Navigation waits for this view on the server while the (workspace) shell shows a loading state of its
// own, so the page doesn't need an instant Suspense fallback.
export const instant = false;

export const metadata: Metadata = { title: "Tomorrow · Taskmaster" };

export default function TomorrowPage({ searchParams }: PageProps<"/tomorrow">) {
  return <WorkspacePage scope={{ view: "tomorrow" }} searchParams={searchParams} />;
}
