"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

/**
 * Habillage commun : la barre de navigation est présente partout ;
 * le pied de page est masqué dans le tunnel (`/commander`), comme dans
 * le prototype d'origine.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inTunnel = pathname.startsWith("/commander");

  return (
    <div className="sky-root">
      <Nav />
      {children}
      {!inTunnel && <Footer />}
    </div>
  );
}
