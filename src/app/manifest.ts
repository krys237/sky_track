import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkyTrack — Cartes & tags de tracking",
    short_name: "SkyTrack",
    description:
      "Retrouvez vos objets depuis votre téléphone via Google Find Hub et Apple Localiser. Commande et activation SkyTrack.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F8FC",
    theme_color: "#F4F8FC",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
