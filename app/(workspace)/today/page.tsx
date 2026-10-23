import type { Metadata } from "next";
import { WorkspacePage } from "../workspace-page";

export const metadata: Metadata = { title: "Today · Taskmaster" };

export default function TodayPage({ searchParams }: PageProps<"/today">) {
  return <WorkspacePage scope={{ view: "today" }} searchParams={searchParams} />;
}
