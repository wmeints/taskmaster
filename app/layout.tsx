import type { Metadata } from "next";
import "./globals.css";
import { htmlClassName } from "./fonts";

export const metadata: Metadata = {
  title: "Taskmaster",
  description: "A fast, focused todo app built for the keyboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={htmlClassName}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
