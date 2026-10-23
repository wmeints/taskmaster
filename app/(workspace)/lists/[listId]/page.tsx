import { WorkspacePage } from "../../workspace-page";

export default function ListPage({ params, searchParams }: PageProps<"/lists/[listId]">) {
  return <WorkspacePage scope={params.then(({ listId }) => ({ listId }))} searchParams={searchParams} />;
}
