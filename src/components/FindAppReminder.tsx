"use client";

import React from "react";
import { X, Signal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STORE_URLS } from "@/components/tunnel/StepDownload";
import {
  detectPlatform,
  hasPaidOnDevice,
  isFindAppDone,
  markFindAppDone,
  markPaidOnDevice,
  type Platform,
} from "@/lib/findapp";
import { claimBanner, releaseBanner, subscribeBanner } from "./banner-bus";

/**
 * Rappel « après achat » : si le visiteur a déjà payé (marque locale posée à la
 * fin du tunnel, ou commande `payee` trouvée en base pour un compte connecté)
 * mais n'a pas encore récupéré l'app de suivi, on lui propose Find Hub /
 * Localiser dès l'arrivée sur le site.
 *
 * « Récupéré » = il a cliqué vers le store OU appuyé sur « J'ai déjà l'app »
 * (le web ne permet pas de détecter une app réellement installée). La croix ne
 * fait que reporter au lendemain ; les deux actions ci-dessus sont définitives.
 */

const SNOOZE_KEY = "skytrack-findapp-snooze-at";
const SNOOZE_DAYS = 1;
const SHOW_DELAY_MS = 2200;

const PAID_STATUTS = ["payee", "expediee", "livree"];

function recentlySnoozed(): boolean {
  try {
    const at = Number(localStorage.getItem(SNOOZE_KEY));
    return !!at && Date.now() - at < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** Une commande payée en base pour la session en cours ? (RLS : ses commandes) */
async function hasPaidOrderInDb(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data, error } = await supabase
      .from("commandes")
      .select("id")
      .in("statut", PAID_STATUTS)
      .limit(1);
    if (error) return false;
    return (data ?? []).length > 0;
  } catch {
    return false;
  }
}

export function FindAppReminder() {
  const [visible, setVisible] = React.useState(false);
  const [platform, setPlatform] = React.useState<Platform>("other");

  React.useEffect(() => {
    if (isFindAppDone() || recentlySnoozed()) return;

    let cancelled = false;
    let timerDone = false;
    let eligible = hasPaidOnDevice();

    const show = () => {
      if (cancelled || !claimBanner("findapp")) return;
      setPlatform(detectPlatform());
      setVisible(true);
    };

    const timer = setTimeout(() => {
      timerDone = true;
      if (eligible) show();
    }, SHOW_DELAY_MS);

    // Pas de marque locale (autre appareil, données effacées…) : on regarde en
    // base si le compte connecté a une commande payée. Résultat positif mis en
    // cache localement pour éviter la requête aux prochaines visites.
    if (!eligible) {
      hasPaidOrderInDb().then((paid) => {
        if (!paid || cancelled) return;
        markPaidOnDevice();
        eligible = true;
        if (timerDone) show();
      });
    }

    // Si l'invite PWA est ouverte manuellement (footer), on s'efface.
    const unsubscribe = subscribeBanner((owner) => {
      if (owner && owner !== "findapp") setVisible(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const close = (definitive: boolean) => {
    setVisible(false);
    releaseBanner("findapp");
    if (definitive) {
      markFindAppDone();
    } else {
      try {
        localStorage.setItem(SNOOZE_KEY, String(Date.now()));
      } catch {}
    }
  };

  if (!visible) return null;

  const sub =
    platform === "ios"
      ? "L'app Localiser est déjà sur votre iPhone — c'est là que votre carte s'active et se suit."
      : platform === "android"
        ? "Il ne reste qu'à installer l'app Find Hub de Google pour l'activer et la suivre."
        : "Sur votre téléphone, installez Find Hub (Android) ou ouvrez Localiser (iPhone) pour l'activer et la suivre.";

  const storeUrl = platform === "ios" ? STORE_URLS.apple : STORE_URLS.play;
  const storeLabel = platform === "ios" ? "Voir dans l'App Store" : "Installer Find Hub";

  return (
    <div className="a2hs" role="dialog" aria-label="Installez l'app de suivi">
      <button className="a2hs-close" onClick={() => close(false)} aria-label="Fermer">
        <X size={16} />
      </button>

      <div className="a2hs-head">
        <span className="a2hs-icon">
          <Signal size={26} style={{ color: "var(--signal)" }} />
        </span>
        <div>
          <p className="a2hs-title">Votre carte SkyTrack est prête !</p>
          <p className="a2hs-sub">{sub}</p>
        </div>
      </div>

      <div className="a2hs-actions">
        <a
          className="btn btn-primary a2hs-btn"
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => close(true)}
        >
          {storeLabel}
        </a>
        <button className="btn btn-ghost a2hs-btn" onClick={() => close(true)}>
          J&apos;ai déjà l&apos;app
        </button>
      </div>
    </div>
  );
}
