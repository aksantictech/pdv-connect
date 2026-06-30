import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDV Connect",
    short_name: "PDV Connect",
    description:
      "Plateforme numérique de gestion et d’expansion de CEF Parole de Vie",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#f4f8fc",
    theme_color: "#0a3d82",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}