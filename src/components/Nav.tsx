"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Logo, Btn } from "./ui";
import { useNav } from "@/lib/useNav";
import { useUser } from "@/lib/useUser";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS, pathToPage } from "@/lib/nav";
import type { PageKey } from "@/lib/nav";

const LABEL = Object.fromEntries(NAV_ITEMS) as Record<PageKey, string>;
// Liens de premier niveau + regroupement « Aide » (FAQ / Support) dans un menu déroulant,
// à l'image du « Info ⌄ » du modèle — ça allège la capsule.
const PRIMARY: PageKey[] = ["home", "how", "products"];
const AIDE: PageKey[] = ["guide", "faq", "support", "contact"];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const { go, order } = useNav();
  const router = useRouter();
  const pathname = usePathname();
  const active = pathToPage(pathname);
  const { user } = useUser();
  const ddRef = useRef<HTMLDivElement>(null);

  const aideActive = active === "faq" || active === "support" || active === "contact" || active === "guide";
  const accountActive = pathname.startsWith("/compte") || pathname.startsWith("/mes-commandes");

  const goPage = (k: PageKey) => { go(k); setOpen(false); setDdOpen(false); };
  const goTo = (href: string) => { router.push(href); setOpen(false); };

  const signOut = async () => {
    await createClient().auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  // Ferme le dropdown au clic extérieur / touche Échap.
  useEffect(() => {
    if (!ddOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDdOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [ddOpen]);

  return (
    <div className="nav-float">
      <div className="nav-capsule">
        <Logo onClick={() => goPage("home")} />

        {/* Liens (desktop) */}
        <div className="nav-links">
          {PRIMARY.map((k) => (
            <span key={k} className={`navlink ${active === k ? "active" : ""}`} onClick={() => goPage(k)}>{LABEL[k]}</span>
          ))}

          <div
            className="nav-dd"
            ref={ddRef}
            onMouseEnter={() => setDdOpen(true)}
            onMouseLeave={() => setDdOpen(false)}
          >
            <button
              className={`navlink ${aideActive ? "active" : ""}`}
              data-open={ddOpen}
              aria-haspopup="menu"
              aria-expanded={ddOpen}
              onClick={() => setDdOpen(true)}
            >
              Aide <ChevronDown size={15} className="nav-caret" />
            </button>
            {ddOpen && (
              <div className="nav-dd-pop" role="menu">
                <div className="nav-dd-menu">
                  {AIDE.map((k) => (
                    <button key={k} role="menuitem" className={`nav-dd-item ${active === k ? "active" : ""}`} onClick={() => goPage(k)}>
                      {LABEL[k]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions (desktop) */}
        <div className="nav-actions">
          {user ? (
            <>
              <span className={`navlink ${accountActive ? "active" : ""}`} onClick={() => goTo("/compte")}>Mon compte</span>
              <span className="navlink" onClick={signOut} title="Déconnexion" aria-label="Déconnexion"><LogOut size={15} /></span>
            </>
          ) : (
            <span className={`navlink ${pathname.startsWith("/connexion") ? "active" : ""}`} onClick={() => goTo("/connexion")}>Connexion</span>
          )}
          <Btn variant="primary" className="nav-cta" onClick={() => order()}>Commander <ArrowRight size={16} /></Btn>
        </div>

        {/* Hamburger (mobile) */}
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Panneau mobile */}
      {open && (
        <div className="nav-mobile">
          {[...PRIMARY, ...AIDE].map((k) => (
            <span key={k} className={`navlink ${active === k ? "active" : ""}`} onClick={() => goPage(k)}>{LABEL[k]}</span>
          ))}
          {user ? (
            <>
              <span className={`navlink ${accountActive ? "active" : ""}`} onClick={() => goTo("/compte")}>Mon compte</span>
              <span className="navlink" onClick={() => goTo("/mes-commandes")}>Mes commandes</span>
              <span className="navlink" onClick={signOut}><LogOut size={16} /> Déconnexion</span>
            </>
          ) : (
            <span className={`navlink ${pathname.startsWith("/connexion") ? "active" : ""}`} onClick={() => goTo("/connexion")}>Connexion</span>
          )}
          <Btn variant="primary" className="nav-cta" onClick={() => { order(); setOpen(false); }} style={{ marginTop: 8, width: "100%" }}>
            Commander ma carte <ArrowRight size={16} />
          </Btn>
        </div>
      )}
    </div>
  );
}
