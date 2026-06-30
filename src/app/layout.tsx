import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import AppShell from "../components/layout/AppShell";

export const metadata: Metadata = {
  title: "PDV Connect",
  description: "Plateforme numérique de gestion de CEF Parole de Vie",
  manifest: "/manifest.json",

  themeColor: "#0a3d82",

  applicationName: "PDV Connect",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PDV Connect",
  },

  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
children,
}: {
children: ReactNode;
}) {
return (<html lang="fr"><body><AppShell>{children}</AppShell></body></html>);
}
