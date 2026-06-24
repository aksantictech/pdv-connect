"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import PublicChatbot from "../public/PublicChatbot";


export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminArea && <SiteHeader />}
      {children}
      {!pathname.startsWith("/admin") && !pathname.startsWith("/connexion") && ( <PublicChatbot />
)}

    </>
  );
}