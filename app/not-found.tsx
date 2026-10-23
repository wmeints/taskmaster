import type { Metadata } from "next";

import { NotFoundMessage } from "@/components/organisms/not-found-message";
import { SearchPartyCard } from "@/components/organisms/search-party-card";
import { SplitTemplate } from "@/components/templates/split-template";

export const metadata: Metadata = {
  title: "Page not found · Taskmaster",
};

export default function NotFound() {
  return (
    <SplitTemplate aside={<SearchPartyCard />}>
      <NotFoundMessage />
    </SplitTemplate>
  );
}
