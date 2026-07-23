"use client";

import React from "react";
import { Signal, Wallet, Check, MapPin, Plus, Compass } from "lucide-react";
import type { OS } from "@/lib/types";

/**
 * Source unique du parcours de configuration : chaque étape porte **à la fois**
 * son texte et l'écran de téléphone qui l'illustre.
 *
 * Auparavant, `StepSetup` tenait deux tableaux de textes et `phones.tsx` deux
 * tableaux d'écrans — quatre listes parallèles indexées à la main, qui
 * pouvaient diverger sans que rien ne le signale. Ici, ajouter ou retirer une
 * étape met à jour texte, visuel et pastilles de navigation d'un seul geste.
 *
 * Contenu repris du « Guide d'utilisation simple — Carte Finder » (manuel
 * fabricant), complété des écrans réels de Find Hub et de Localiser.
 */
export interface SetupStep {
  /** Libellé court affiché sous le téléphone. */
  title: string;
  /** Consigne affichée dans la liste numérotée. */
  text: React.ReactNode;
  screen: React.ReactNode;
}

/* ── Écrans partagés ─────────────────────────────────────────────────────── */

/** Allumage de la carte : identique sur les deux plateformes. */
const cardPressScreen = (
  <div className="ph-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <div className="thecard" style={{ transform: "scale(1.1)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Signal size={12} style={{ color: "var(--signal)" }} />
        <span className="pulse-dot" />
      </div>
      <div className="font-mono" style={{ fontSize: 8, color: "rgba(255,255,255,.62)" }}>SKYTRACK · CARD</div>
    </div>
    <div style={{ fontSize: 13, fontWeight: 600 }}>Appuyez sur le bouton</div>
    <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>un bip confirme l&apos;allumage</div>
  </div>
);

/* ── Android ─────────────────────────────────────────────────────────────── */

const ANDROID: SetupStep[] = [
  {
    title: "Application",
    text: (
      <>Ouvrez <b>Find Hub</b> (anciennement « Localiser mon appareil »), déjà présent sur
      Android. Mettez-le à jour depuis le Play Store si nécessaire.</>
    ),
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>Google Play</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, borderRadius: 10, border: "1px solid var(--line)", marginBottom: "auto" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(37,99,235,.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
            <Compass size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Find Hub</div>
            <div className="muted" style={{ fontSize: 10.5 }}>Google LLC</div>
          </div>
        </div>
        <div style={{ background: "linear-gradient(96deg,var(--primary),var(--primary-dim))", color: "#fff", textAlign: "center", padding: 9, borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Ouvrir</div>
      </div>
    ),
  },
  {
    title: "Allumer",
    text: (
      <>Appuyez une fois sur le bouton de la carte — ou maintenez-le <b>3 secondes</b> selon
      le modèle. <b>Un bip</b> confirme l&apos;allumage.</>
    ),
    screen: cardPressScreen,
  },
  {
    title: "Fast Pair",
    text: (
      <>Le pop-up <b>Fast Pair</b> s&apos;affiche tout seul : touchez « Connecter ».
      <br />
      <span style={{ opacity: .85 }}>Rien ne s&apos;affiche ? Ouvrez Find Hub, touchez <b>+</b> puis « Ajouter un appareil ».</span></>
    ),
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ height: 120, borderRadius: 12, background: "rgba(140,183,214,.06)", marginBottom: "auto" }} />
        <div className="ph-pop">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(16,185,129,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Signal size={16} style={{ color: "var(--signal)" }} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>SkyTrack Card</div>
              <div className="muted" style={{ fontSize: 10.5 }}>Appareil à proximité</div>
            </div>
          </div>
          <div style={{ background: "linear-gradient(96deg,var(--signal),var(--signal-dim))", color: "#fff", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 700 }}>Connecter</div>
        </div>
      </div>
    ),
  },
  {
    title: "Compte Google",
    text: (
      <>Choisissez votre compte, acceptez l&apos;usage responsable, puis <b>donnez un nom</b> à
      la carte (ex. « Portefeuille »).</>
    ),
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>Lier à votre compte Google</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--line)", marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(140,183,214,.15)" }} />
          <span style={{ fontSize: 11.5 }} className="muted">compte@gmail.com</span>
        </div>
        <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.5, marginBottom: "auto" }}>Utilisez la carte de façon responsable, sûre et légale.</div>
        <div style={{ background: "var(--bg-alt)", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 600 }}>J&apos;accepte</div>
      </div>
    ),
  },
  {
    title: "Find Hub",
    text: (
      <>C&apos;est prêt. La carte apparaît dans Find Hub : dernière position, sonnerie à
      distance, et mode « objet perdu ».</>
    ),
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>Find Hub</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px", borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)", marginBottom: 10 }}>
          <Wallet size={18} style={{ color: "var(--signal)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Mon portefeuille</div>
            <div className="sig" style={{ fontSize: 10.5 }}>À proximité · maintenant</div>
          </div>
          <Check size={16} style={{ color: "var(--signal)" }} />
        </div>
        <div style={{ height: 90, borderRadius: 10, background: "linear-gradient(160deg,rgba(16,185,129,.06),transparent)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "auto" }}>
          <MapPin size={22} style={{ color: "var(--signal)" }} />
        </div>
      </div>
    ),
  },
];

/* ── iPhone ──────────────────────────────────────────────────────────────── */

const IOS: SetupStep[] = [
  {
    title: "Localiser",
    text: (
      <>Ouvrez l&apos;app <b>Localiser</b>, déjà installée sur iPhone. Aucune application
      tierce n&apos;est nécessaire.</>
    ),
    screen: (
      <div className="ph-body">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Localiser</div>
        <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--line)", paddingBottom: 10, marginBottom: 14 }}>
          <span className="muted" style={{ fontSize: 12 }}>Personnes</span>
          <span className="muted" style={{ fontSize: 12 }}>Appareils</span>
          <span className="sig" style={{ fontSize: 12, fontWeight: 700 }}>Objets</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 11px", borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px dashed rgba(16,185,129,.4)" }}>
          <Plus size={16} style={{ color: "var(--signal)" }} />
          <span className="sig" style={{ fontSize: 12.5, fontWeight: 600 }}>Ajouter un objet</span>
        </div>
      </div>
    ),
  },
  {
    title: "Allumer",
    text: (
      <>Appuyez une fois sur le bouton de la carte — ou maintenez-le <b>3 secondes</b> selon
      le modèle. <b>Un bip</b> confirme l&apos;allumage.</>
    ),
    screen: cardPressScreen,
  },
  {
    title: "Ajouter",
    text: (
      <>Dans l&apos;onglet <b>Objets</b> (en bas), touchez <b>+</b> puis « Ajouter un autre
      objet ».</>
    ),
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ height: 110, borderRadius: 12, background: "rgba(140,183,214,.05)", marginBottom: "auto" }} />
        <div className="ph-pop">
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Ajouter un autre objet</div>
          <div className="muted" style={{ fontSize: 10.5, marginBottom: 12 }}>Appuyez sur le bouton de votre carte.</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div className="thecard" style={{ transform: "scale(.85)" }}>
              <div className="font-mono" style={{ fontSize: 8, color: "rgba(255,255,255,.62)" }}>SKYTRACK</div>
              <span className="pulse-dot" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Nommer",
    text: (
      <>La carte est détectée : touchez « Connecter », donnez-lui un nom et un emoji, puis
      confirmez avec votre <b>identifiant Apple</b>.</>
    ),
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0 14px" }}>
          <Wallet size={26} style={{ color: "var(--signal)" }} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>Carte détectée</div>
        <div className="muted" style={{ fontSize: 10.5, marginBottom: "auto", marginTop: 4 }}>Nommez votre objet</div>
        <div style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 11.5, marginBottom: 10 }} className="muted">Mon portefeuille 💳</div>
        <div style={{ width: "100%", background: "linear-gradient(96deg,var(--signal),var(--signal-dim))", color: "#fff", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Continuer</div>
      </div>
    ),
  },
  {
    title: "Terminé",
    text: <>C&apos;est prêt. La carte apparaît dans <b>Localiser → Objets</b>.</>,
    screen: (
      <div className="ph-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Check size={30} style={{ color: "var(--signal)" }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>C&apos;est prêt !</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>Votre carte apparaît dans Localiser → Objets.</div>
      </div>
    ),
  },
];

export const SETUP_STEPS: Record<OS, SetupStep[]> = { android: ANDROID, ios: IOS };

/* ── Réinitialisation ────────────────────────────────────────────────────── */

/**
 * Dépannage, pas installation : hors de la numérotation principale. C'est la
 * marche à suivre pour changer de téléphone ou de réseau — une carte ne se
 * connectant qu'à un seul réseau à la fois.
 */
export function resetSteps(os: OS): { title: string; text: React.ReactNode }[] {
  const app = os === "ios" ? "Localiser" : "Find Hub";
  return [
    {
      title: "Supprimez-la de l'ancien téléphone",
      text: (
        <>Ouvrez <b>{app}</b>, touchez la carte, faites défiler vers le bas puis
        « Supprimer l&apos;objet ».</>
      ),
    },
    {
      title: "Réinitialisation physique",
      text: (
        <>Appuyez <b>4 fois rapidement</b> sur le bouton, puis une <b>5ᵉ fois en maintenant
        environ 5 secondes</b>. Une mélodie confirme que la carte est de nouveau
        jumelable.</>
      ),
    },
  ];
}
