import type { Metadata } from "next";
import { WorkspacePage } from "../workspace-page";

export const metadata: Metadata = { title: "Tomorrow · Taskmaster" };

export default function TomorrowPage({ searchParams }: PageProps<"/tomorrow">) {
  return <WorkspacePage scope={{ view: "tomorrow" }} searchParams={searchParams} />;
}
