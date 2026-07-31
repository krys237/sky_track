"use client";

import React from "react";
import { Signal } from "lucide-react";
import { TransparentImage } from "@/components/ui";
import type { OS } from "@/lib/types";

/**
 * Source unique du parcours de configuration. Chaque étape porte une SÉQUENCE
 * d'écrans (captures réelles de Localiser / Find Hub), chacun avec sa consigne
 * et un repère de tap posé sur le bouton à toucher. Les captures incluent déjà
 * la coque du téléphone → on ne les remet pas dans une maquette.
 *
 * Un seul écran fait exception : l'allumage de la carte (geste physique, pas un
 * écran d'app) est dessiné en code et montre les deux produits réels.
 */

/** Repère de tap animé, en % de l'image (0-100). `label` = texte à côté du repère. */
export interface TapHint {
  x: number;
  y: number;
  label?: string;
}

export interface SetupScreen {
  /** Capture plein-cadre (coque incluse), servie depuis /public/setup. */
  img?: string;
  /** Écran dessiné en code (allumage) — alternative à `img`. */
  node?: React.ReactNode;
  /** Consigne courte, affichée sous l'écran. */
  caption: React.ReactNode;
  /** Repère de tap sur le bouton clé (absent sur les écrans « vitrine »). */
  hint?: TapHint;
  /** Texte alternatif de l'image (accessibilité). */
  alt?: string;
}

export interface SetupStep {
  /** Libellé court de l'étape (décompte + liste). */
  title: string;
  screens: SetupScreen[];
}

/* ── Écran d'allumage : les deux produits physiques + repère « bouton » ─────── */
const powerOnScreen = (
  <div className="setup-poweron">
    <div className="setup-poweron-badge">
      <Signal size={13} style={{ color: "var(--signal)" }} /> Votre matériel SkyTrack
    </div>
    <div className="setup-poweron-grid">
      <figure className="setup-poweron-item">
        <TransparentImage src="/tag-carte.jpeg" alt="Carte SkyTrack" className="setup-poweron-img" />
        <span className="setup-poweron-btn" aria-hidden />
        <figcaption>Carte</figcaption>
      </figure>
      <figure className="setup-poweron-item">
        <TransparentImage src="/tag-rond.png" alt="Tag rond SkyTrack" className="setup-poweron-img" />
        <span className="setup-poweron-btn setup-poweron-btn--rond" aria-hidden />
        <figcaption>Tag rond</figcaption>
      </figure>
    </div>
  </div>
);

const powerOnStep: SetupStep = {
  title: "Allumer",
  screens: [
    {
      node: powerOnScreen,
      caption: (
        <>Appuyez une fois sur le bouton du produit — ou maintenez-le <b>3 secondes</b> selon
        le modèle. <b>Un bip</b> confirme l&apos;allumage.</>
      ),
    },
  ],
};

/* ── Android — Find Hub ─────────────────────────────────────────────────────── */
const ANDROID: SetupStep[] = [
  {
    title: "Installer",
    screens: [
      { img: "/setup/android/01-playstore.png", alt: "Fiche Find Hub sur le Play Store", caption: <>Installez <b>Find Hub</b> depuis le Play&nbsp;Store.</>, hint: { x: 68, y: 17, label: "Installer" } },
      { img: "/setup/android/02-home.png", alt: "Icône Find Hub sur l'écran d'accueil", caption: <>Ouvrez <b>Find Hub</b> depuis votre écran d&apos;accueil.</>, hint: { x: 40, y: 27, label: "Find Hub" } },
      { img: "/setup/android/03-location.png", alt: "Autorisation de localisation", caption: <>Autorisez Find Hub à accéder à la <b>position</b>.</>, hint: { x: 65, y: 52 } },
      { img: "/setup/android/04-bluetooth.png", alt: "Activation du Bluetooth", caption: <>Vérifiez que le <b>Bluetooth</b> est activé.</>, hint: { x: 74, y: 25 } },
    ],
  },
  powerOnStep,
  {
    title: "Connecter",
    screens: [
      { img: "/setup/android/05-detecte.png", alt: "La carte détectée à proximité", caption: <>La carte apparaît « <b>à proximité</b> » dans la liste.</>, hint: { x: 34, y: 45 } },
      { img: "/setup/android/06-connecter.png", alt: "Pop-up de connexion Smart Card", caption: <>Touchez « <b>Connecter</b> » pour l&apos;associer.</>, hint: { x: 75, y: 89 } },
    ],
  },
  {
    title: "Autoriser",
    screens: [
      { img: "/setup/android/07-usage.png", alt: "Usage responsable", caption: <>Acceptez l&apos;usage responsable : <b>Continuer</b>.</>, hint: { x: 74, y: 82 } },
      { img: "/setup/android/08-reseau.png", alt: "Activer le réseau Find Hub", caption: <>Activez le <b>réseau Find Hub</b> pour mieux localiser.</>, hint: { x: 75, y: 82 } },
    ],
  },
  {
    title: "Prêt",
    screens: [
      { img: "/setup/android/09-fiche.png", alt: "Fiche de la carte dans Find Hub", caption: <>C&apos;est prêt : sonnerie, « plus chaud / plus froid » et partage.</> },
    ],
  },
];

/* ── iPhone — Localiser ─────────────────────────────────────────────────────── */
const IOS: SetupStep[] = [
  {
    title: "Ouvrir",
    screens: [
      { img: "/setup/ios/01-home.png", alt: "Icône Localiser sur l'écran d'accueil", caption: <>Ouvrez l&apos;app <b>Localiser</b>, déjà installée sur iPhone.</>, hint: { x: 39, y: 25, label: "Localiser" } },
      { img: "/setup/ios/02-permission.png", alt: "Autorisation de position", caption: <>Autorisez « Localiser » à utiliser votre <b>position</b>.</>, hint: { x: 49, y: 76 } },
      { img: "/setup/ios/03-notif.png", alt: "Activer les notifications", caption: <>Activez les <b>notifications</b> pour être alerté.</>, hint: { x: 49, y: 83 } },
    ],
  },
  powerOnStep,
  {
    title: "Ajouter",
    screens: [
      { img: "/setup/ios/04-objets.png", alt: "Onglet Objets", caption: <>Onglet <b>Objets</b>, touchez « Ajouter un objet ».</>, hint: { x: 49, y: 80 } },
      { img: "/setup/ios/05-ajouter.png", alt: "Ajouter un autre objet", caption: <>Choisissez « <b>Autre objet pris en charge</b> ».</>, hint: { x: 49, y: 84 } },
      { img: "/setup/ios/06-connecter.png", alt: "Carte détectée, bouton Connecter", caption: <>La carte est détectée : touchez « <b>Connecter</b> ».</>, hint: { x: 49, y: 83, label: "Connecter" } },
    ],
  },
  {
    title: "Nommer",
    screens: [
      { img: "/setup/ios/07-nom.png", alt: "Nommer l'objet", caption: <>Donnez un <b>nom</b> à votre carte, puis Continuer.</>, hint: { x: 49, y: 68 } },
      { img: "/setup/ios/08-emoji.png", alt: "Choisir un emoji", caption: <>Choisissez un <b>emoji</b>, puis Continuer.</>, hint: { x: 49, y: 40 } },
      { img: "/setup/ios/09-compte.png", alt: "Association au compte Apple", caption: <>Associez-la à votre <b>compte Apple</b> : Accepter.</>, hint: { x: 49, y: 90 } },
    ],
  },
  {
    title: "Prêt",
    screens: [
      { img: "/setup/ios/10-fiche.png", alt: "Fiche de l'objet", caption: <>C&apos;est prêt : itinéraire, sonnerie et mode perdu.</>, hint: { x: 49, y: 90, label: "Terminer" } },
      { img: "/setup/ios/11-actions.png", alt: "Actions sur l'objet", caption: <>Retrouvez votre carte dans <b>Localiser → Objets</b>.</> },
    ],
  },
];

export const SETUP_STEPS: Record<OS, SetupStep[]> = { android: ANDROID, ios: IOS };

/* ── Réinitialisation ────────────────────────────────────────────────────────
   Dépannage (changer de téléphone / de réseau), hors du décompte principal.
   Les captures reset-1/reset-2 existent dans /public/setup mais restent en
   texte ici : ce bloc est replié par défaut, on garde l'info dense. */
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
