"use client";

import { ServerErrorPage } from "./server-error-page";

export default function ErrorPage(props: { error: unknown; retry: () => void }) {
  return (
    <>
      <title>Something broke · Taskmaster</title>
      <ServerErrorPage {...props} />
    </>
  );
}
