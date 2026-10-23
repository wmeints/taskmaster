"use client";

import "./globals.css";
import { htmlClassName } from "./fonts";
import { ServerErrorPage } from "./server-error-page";

// Replaces the root layout when the layout itself fails, so it brings its own document, styles and fonts.
export default function GlobalError(props: { error: unknown; retry: () => void }) {
  return (
    <html lang="en" className={htmlClassName}>
      <body className="min-h-full flex flex-col">
        <title>Something broke · Taskmaster</title>
        <ServerErrorPage {...props} />
      </body>
    </html>
  );
}
