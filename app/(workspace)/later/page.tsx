import type { Metadata } from "next";
import { WorkspacePage } from "../workspace-page";

export const metadata: Metadata = { title: "Later · Taskmaster" };

export default function LaterPage({ searchParams }: PageProps<"/later">) {
  return <WorkspacePage scope={{ view: "later" }} searchParams={searchParams} />;
}
