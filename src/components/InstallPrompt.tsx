"use client";

import React from "react";
import Image from "next/image";
import { X, Share, SquarePlus, Smartphone, MoreVertical } from "lucide-react";
import { claimBanner, releaseBanner, subscribeBanner } from "./banner-bus";

/**
 * Bannière « Ajouter à l'écran d'accueil » :
 * - Android / Chrome : on capture l'événement `beforeinstallprompt` et on
 *   déclenche l'invite d'installation native au clic.
 * - iPhone / Safari : pas d'invite native possible — on affiche les deux
 *   étapes (Partager → Sur l'écran d'accueil).
 * - Autres navigateurs (ouverture manuelle) : instructions via le menu ⋮.
 * Jamais affichée si le site tourne déjà en mode installé (standalone).
 * Un refus la masque pendant DISMISS_DAYS jour(s), mais elle reste
 * accessible à tout moment via `openInstallPrompt()` (lien du footer).
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "skytrack-a2hs-dismissed-at";
const DISMISS_DAYS = 1;
const SHOW_DELAY_MS = 2600;
const OPEN_EVENT = "skytrack:open-install";

/** Ouvre la bannière d'installation manuellement (ignore le refus mémorisé). */
export function openInstallPrompt() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return !!at && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const iosDevice = /iPhone|iPad|iPod/.test(ua);
  const ipadOs = ua.includes("Mac") && "ontouchend" in document;
  return iosDevice || ipadOs;
}

export function InstallPrompt() {
  const [mode, setMode] = React.useState<"hidden" | "native" | "ios" | "generic">("hidden");
  const deferredPrompt = React.useRef<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    if (isStandalone()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const autoShow = (m: "native" | "ios") => {
      if (recentlyDismissed()) return;
      // Le créneau bannière est partagé avec le rappel « app de suivi » :
      // si celui-ci s'affiche déjà, on attend la prochaine visite.
      timer = setTimeout(() => {
        if (claimBanner("install")) setMode(m);
      }, SHOW_DELAY_MS);
    };

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      autoShow("native");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIos()) autoShow("ios");

    // Ouverture manuelle (lien « Installer l'application ») : pas de délai,
    // et on passe outre le refus mémorisé.
    const onOpen = () => {
      claimBanner("install", true); // évince l'autre bannière si besoin
      if (deferredPrompt.current) setMode("native");
      else if (isIos()) setMode("ios");
      else setMode("generic");
    };
    window.addEventListener(OPEN_EVENT, onOpen);

    const onInstalled = () => {
      setMode("hidden");
      releaseBanner("install");
    };
    window.addEventListener("appinstalled", onInstalled);

    const unsubscribe = subscribeBanner((owner) => {
      if (owner && owner !== "install") setMode("hidden");
    });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("appinstalled", onInstalled);
      unsubscribe();
    };
  }, []);

  const dismiss = () => {
    setMode("hidden");
    releaseBanner("install");
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const install = async () => {
    const evt = deferredPrompt.current;
    if (!evt) return;
    deferredPrompt.current = null;
    setMode("hidden");
    releaseBanner("install");
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    }
  };

  if (mode === "hidden") return null;

  return (
    <div className="a2hs" role="dialog" aria-label="Ajouter SkyTrack à l'écran d'accueil">
      <button className="a2hs-close" onClick={dismiss} aria-label="Fermer">
        <X size={16} />
      </button>

      <div className="a2hs-head">
        <span className="a2hs-icon">
          <Image src="/icons/icon-192.png" alt="" width={44} height={44} />
        </span>
        <div>
          <p className="a2hs-title">Accédez à SkyTrack en 1 clic</p>
          <p className="a2hs-sub">
            Ajoutez SkyTrack à votre écran d&apos;accueil, comme une application.
          </p>
        </div>
      </div>

      {mode === "native" && (
        <div className="a2hs-actions">
          <button className="btn btn-primary a2hs-btn" onClick={install}>
            <Smartphone size={17} />
            Ajouter à l&apos;écran d&apos;accueil
          </button>
          <button className="btn btn-ghost a2hs-btn" onClick={dismiss}>
            Plus tard
          </button>
        </div>
      )}

      {mode === "ios" && (
        <ol className="a2hs-steps">
          <li>
            Touchez <Share size={15} className="a2hs-inline-ico" aria-hidden />{" "}
            <strong>Partager</strong> dans la barre de Safari
          </li>
          <li>
            Choisissez <SquarePlus size={15} className="a2hs-inline-ico" aria-hidden />{" "}
            <strong>Sur l&apos;écran d&apos;accueil</strong>
          </li>
        </ol>
      )}

      {mode === "generic" && (
        <ol className="a2hs-steps">
          <li>
            Ouvrez le menu <MoreVertical size={15} className="a2hs-inline-ico" aria-hidden /> de
            votre navigateur
          </li>
          <li>
            Choisissez <SquarePlus size={15} className="a2hs-inline-ico" aria-hidden />{" "}
            <strong>Ajouter à l&apos;écran d&apos;accueil</strong>
          </li>
        </ol>
      )}
    </div>
  );
}
