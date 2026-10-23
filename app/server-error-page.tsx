"use client";

import { useEffect } from "react";

import { ServerErrorMessage } from "@/components/organisms/server-error-message";
import { ServerTodoCard } from "@/components/organisms/server-todo-card";
import { SplitTemplate } from "@/components/templates/split-template";

// What app/error.tsx and app/global-error.tsx show when rendering fails.
export function ServerErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Errors from Server Components carry a digest that matches the server logs; thrown non-Errors don't.
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;

  return (
    <SplitTemplate aside={<ServerTodoCard />}>
      <ServerErrorMessage digest={digest} onRetry={retry} />
    </SplitTemplate>
  );
}
