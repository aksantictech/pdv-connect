"use client";

import SearchInput from "@/components/ui/forms/SearchInput";

export default function HeaderSearch() {
  return (
    <div className="hidden w-full max-w-md px-6 lg:block">
      <SearchInput placeholder="Rechercher membre, élève, assemblée..." />
    </div>
  );
}