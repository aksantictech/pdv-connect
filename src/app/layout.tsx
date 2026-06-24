import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppShell from "../components/layout/AppShell";

export const metadata: Metadata = {
title: "PDV Connect",
description: "Plateforme de gestion de CEF Parole de Vie",
};

export default function RootLayout({
children,
}: {
children: ReactNode;
}) {
return (<html lang="fr"><body><AppShell>{children}</AppShell></body></html>);

}
