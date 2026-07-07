"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Pack, PackId } from "./types";
import { PAGE_TO_PATH, commanderHref, type PageKey } from "./nav";

/**
 * Reproduit les helpers `go` / `order` du prototype state-based, mais câblés
 * sur le routeur Next. `order()` entre dans le tunnel ; si un pack est fourni,
 * il est pré-sélectionné (le tunnel démarrera alors à l'étape « Compte »).
 */
export function useNav() {
  const router = useRouter();

  const go = useCallback(
    (page: PageKey) => {
      const path = PAGE_TO_PATH[page];
      // Cibles « ancre » (/#how, /#products) → scroll doux si on est déjà sur la
      // home (l'App Router ne scrolle pas de façon fiable sur un push same-page),
      // sinon route vers la home avec le hash.
      if (path.startsWith("/#")) {
        const id = path.slice(2);
        if (window.location.pathname === "/") {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", path);
        } else {
          router.push(path);
        }
        return;
      }
      router.push(path);
    },
    [router],
  );

  const order = useCallback(
    (pack?: Pack | PackId) => {
      const id: PackId | undefined =
        typeof pack === "string" ? pack : pack?.id;
      router.push(commanderHref(id));
    },
    [router],
  );

  return { go, order };
}
