import type { Metadata } from "next";
import { WorkspacePage } from "../workspace-page";

export const metadata: Metadata = { title: "Inbox · Taskmaster" };

export default function InboxPage({ searchParams }: PageProps<"/inbox">) {
  return <WorkspacePage scope={{ view: "inbox" }} searchParams={searchParams} />;
}
