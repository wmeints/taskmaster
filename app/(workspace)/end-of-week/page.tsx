import type { Metadata } from "next";
import { WorkspacePage } from "../workspace-page";

export const metadata: Metadata = { title: "End of week · Taskmaster" };

export default function EndOfWeekPage({ searchParams }: PageProps<"/end-of-week">) {
  return <WorkspacePage scope={{ view: "end-of-week" }} searchParams={searchParams} />;
}
