"use client";

import React from "react";
import {
  ArrowRight, PlayCircle, Signal, Lock, Smartphone, Truck, Plus,
  Check, Fingerprint, LockKeyhole,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Btn, SectionHead, TransparentImage } from "@/components/ui";
import { InteractiveFolderGallery } from "@/components/InteractiveFolderGallery";
import { PackOptions } from "@/components/PackOptions";
import { TagModal } from "@/components/TagModal";
import { PrincipleRoad } from "@/components/PrincipleRoad";
import { BENEFITS, TAG_PRODUCTS } from "@/lib/content";
import type { TagProduct } from "@/lib/types";
import { useNav } from "@/lib/useNav";

const CTA_LABEL = "Commander ma carte";

// Stats de confiance affichées en bas de la section « À quoi ça sert » (icône · valeur forte · libellé)
const USAGE_STATS: [LucideIcon, string, string][] = [
  [Signal, "+1 milliard", "d'appareils dans le réseau"],
  [Lock, "Chiffré", "localisation de bout en bout"],
  [Smartphone, "Android", "réseau Google Find Hub"],
  [Truck, "Cameroun", "livraison locale"],
];

// Accents de marque cyclés sur les puces d'avantages (vert signal / bleu / ambre)
const USAGE_ACCENTS = [
  { bg: "rgba(5,150,105,.10)", fg: "var(--signal)" },
  { bg: "rgba(37,99,235,.10)", fg: "var(--primary)" },
  { bg: "rgba(245,158,11,.13)", fg: "var(--amber-ink)" },
  { bg: "rgba(5,150,105,.10)", fg: "var(--signal)" },
];

// Confidentialité — garanties cochées (formulées à partir des TRUTHS réelles ; la liste
// complète et détaillée vit sur /comment-ca-marche). On n'invente aucune promesse.
const PRIVACY_CHECKS = [
  "Chiffrement de bout en bout",
  "Ni Google ni SkyTrack n'y accèdent",
  "Protection anti-pistage intégrée",
  "Vous choisissez qui voit la position",
];

export default function HomePage() {
  const { go, order } = useNav();
  const [openTag, setOpenTag] = React.useState<TagProduct | null>(null);
  const tagRond = TAG_PRODUCTS.find((t) => t.id === "rond")!;
  const tagCarte = TAG_PRODUCTS.find((t) => t.id === "carte")!;

  return (
    <div className="z">
      {/* 01 — HERO (disposition conservée : texte gauche / produit droite) */}
      <div className="wrap" style={{ paddingTop: 46, paddingBottom: 40 }}>
        <div className="stack-sm" style={{ display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ flex: "1 1 480px" }} className="reveal">
            <div className="chip" style={{ marginBottom: 22 }}>
              <span className="pulse-dot" /> Réseau Find Hub de Google · +1 milliard d&apos;appareils
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(34px,6.4vw,60px)", fontWeight: 800, lineHeight: 1.03, letterSpacing: "-.03em", margin: 0 }}>
              Ne perdez plus jamais<br /><span className="sig">ce qui compte.</span>
            </h1>
            <p className="muted" style={{ fontSize: 19, lineHeight: 1.6, marginTop: 22, maxWidth: 480 }}>
              La carte <b style={{ color: "var(--text)" }}>SkyTrack</b> se glisse dans votre portefeuille et le retrouve depuis votre téléphone — même à l&apos;autre bout de la ville.
            </p>
            <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
              <Btn variant="primary" onClick={() => order()}>{CTA_LABEL} <ArrowRight size={18} /></Btn>
              <Btn variant="ghost" onClick={() => go("how")}><PlayCircle size={18} /> Comment ça marche</Btn>
            </div>
          </div>
          <div style={{ flex: "1.2 1 520px", display: "flex", justifyContent: "center", minWidth: 280, maxWidth: "100%" }} className="reveal">
            <InteractiveFolderGallery />
          </div>
        </div>
      </div>

      {/* 02 — CONFIDENTIALITÉ « Vos objets, jamais vos données » (duo de cartes d'après le
          modèle : carte-promesse verte pleine + carte-garanties blanche checklist | explication).
          Placée juste sous le hero : on rassure avant d'expliquer l'usage. */}
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 30 }}>
        <div className="privacy-duo">
          {/* Carte-promesse : aplat vert (réassurance), filigrane empreinte digitale */}
          <div className="privacy-promise reveal">
            <h2>Vos objets,<br />jamais vos données.</h2>
            <p>
              La position de vos affaires est chiffrée de bout en bout. Personne d&apos;autre
              que vous ne peut la lire.
            </p>
            <div className="pp-seal">
              <span className="pp-seal-ic"><LockKeyhole size={19} /></span>
              Chiffré de bout en bout
            </div>
            <Fingerprint className="pp-watermark" size={190} strokeWidth={1.1} />
          </div>

          {/* Carte-garanties : checklist des engagements · explication + lien */}
          <div className="privacy-guarantees reveal">
            <div className="pg-checks">
              {PRIVACY_CHECKS.map((t, i) => (
                <div key={i} className="pg-check">
                  <span className="pg-check-ic"><Check size={14} strokeWidth={3} /></span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="pg-aside">
              <h3>Retrouver, pas surveiller</h3>
              <p>
                SkyTrack localise vos objets. Une norme commune Google et Apple empêche
                d&apos;en suivre une personne à son insu.
              </p>
              <button type="button" className="pg-link" onClick={() => go("faq")}>
                Vos questions sur la vie privée <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 03 — À QUOI ÇA SERT (modèle : visuel composé à gauche · contenu à droite · stats de confiance en bas) */}
      <div className="wrap" style={{ paddingTop: 84, paddingBottom: 30 }}>
        <div className="usage-split">
          {/* Visuel composé : deux produits cliquables (chacun s'anime au survol/focus
              et ouvre sa fiche) + badge circulaire décoratif */}
          <div className="usage-visual reveal">
            <button
              type="button"
              className="usage-card-main"
              onClick={() => setOpenTag(tagCarte)}
              aria-label="Voir les caractéristiques de la carte SkyTrack"
            >
              <TransparentImage src="/tag-carte.jpeg" alt="Carte SkyTrack" />
              <span className="usage-hint"><Plus size={13} /> Voir la carte</span>
            </button>
            <button
              type="button"
              className="usage-card-front"
              onClick={() => setOpenTag(tagRond)}
              aria-label="Voir les caractéristiques du tag rond SkyTrack"
            >
              <TransparentImage src="/tag-rond.png" alt="Tag rond SkyTrack" />
              <span className="usage-hint"><Plus size={13} /> Voir le tag</span>
            </button>
            <div className="usage-badge">
              <b>24/7</b>
              <span>suivi continu</span>
            </div>
          </div>

          {/* Contenu : eyebrow · titre · sous-titre · avantages */}
          <div className="usage-content reveal">
            <div className="eyebrow" style={{ marginBottom: 14 }}>À quoi ça sert</div>
            <h2 className="font-display" style={{ fontSize: "clamp(26px,4.5vw,40px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-.02em", margin: 0 }}>
              Une carte, tout ce qui compte
            </h2>
            <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, marginTop: 16, maxWidth: 460 }}>
              Fine comme une carte bancaire, elle veille sur vos objets de valeur au quotidien.
            </p>
            <div className="usage-features">
              {BENEFITS.map((b, i) => {
                const c = USAGE_ACCENTS[i % USAGE_ACCENTS.length];
                return (
                  <div key={i} className="usage-feature">
                    <div className="usage-feature-ic" style={{ background: c.bg, color: c.fg }}>
                      <b.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{b.t}</h3>
                      <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{b.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bande de stats de confiance (comme sur le modèle) */}
        <div className="usage-stats">
          {USAGE_STATS.map(([Ic, big, label], i) => {
            const c = USAGE_ACCENTS[i % USAGE_ACCENTS.length];
            return (
              <div key={i} className="usage-stat">
                <b><Ic size={19} style={{ color: c.fg }} /> {big}</b>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 04 — COMMENT ÇA MARCHE (route sinueuse en perspective, réf. model-principe) */}
      <div className="wrap" style={{ paddingTop: 78, paddingBottom: 20 }}>
        <SectionHead center eyebrow="Le principe" title="Comment votre objet se fait retrouver" sub="Cinq temps, et une multitude de téléphones qui travaillent pour vous." />
        <PrincipleRoad />
      </div>

      {/* 05 — NOS PACKS (2 options, une par produit — données uniquement, cf JOURNAL.md) */}
      <div className="wrap" style={{ paddingTop: 78, paddingBottom: 20 }}>
        <SectionHead center eyebrow="Nos produits" title="Choisissez votre protection" />
        <PackOptions onOrder={() => order()} />
      </div>

      {/* 06 — CTA FINAL */}
      <div className="wrap" style={{ padding: "70px 20px" }}>
        <div className="card" style={{ padding: "44px 28px", textAlign: "center", background: "linear-gradient(120deg,rgba(59,130,246,.1),rgba(245,158,11,.08))", border: "1px solid rgba(59,130,246,.22)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -20, width: 130, opacity: .5, transform: "rotate(12deg)", pointerEvents: "none" }}>
            <TransparentImage src="/tag-rond.png" alt="" style={{ width: "100%", height: "auto" }} />
          </div>
          <div style={{ position: "relative" }}>
            <h2 className="font-display" style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-.02em" }}>Prêt à ne plus rien perdre ?</h2>
            <p className="muted" style={{ fontSize: 17, margin: "0 auto 26px", maxWidth: 460 }}>Commandez, payez par Mobile Money ou carte, et activez votre carte en quelques minutes.</p>
            <Btn variant="primary" onClick={() => order()}>{CTA_LABEL} <ArrowRight size={18} /></Btn>
          </div>
        </div>
      </div>

      {/* Modale de caractéristiques (ouverte au clic sur un visuel) */}
      <TagModal
        product={openTag}
        onClose={() => setOpenTag(null)}
        onOrder={() => { setOpenTag(null); order(); }}
      />
    </div>
  );
}
