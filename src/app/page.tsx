"use client";

import React from "react";
import {
  ArrowRight, PlayCircle, Signal, Lock, Smartphone, Truck, Plus,
  Check, Fingerprint, LockKeyhole, Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Btn, SectionHead, TransparentImage } from "@/components/ui";
import { InteractiveFolderGallery } from "@/components/InteractiveFolderGallery";
import { PackOptions } from "@/components/PackOptions";
import { TagModal } from "@/components/TagModal";
import { PrincipleRoad } from "@/components/PrincipleRoad";
import { HeroBackground } from "@/components/HeroBackground";
import { BENEFITS, TAG_PRODUCTS } from "@/lib/content";
import type { TagProduct } from "@/lib/types";
import { useNav } from "@/lib/useNav";

const CTA_LABEL = "Commander ma carte";

// Moyens de paiement affichés dans la section finale (logos → public/payments).
// Chaque carte reprend le modèle « model-pret a ne plus rien perdre » : logo d'un
// côté, texte de l'autre (alternance gauche/droite via la classe .rev).
const PAYMENTS: { id: string; name: string; img: string; desc: string; tag: string }[] = [
  { id: "mtn", name: "MTN Mobile Money", img: "/payments/mtn-mobile-money.jpg", desc: "Payez depuis votre téléphone MTN, sans compte bancaire.", tag: "Sans banque" },
  { id: "orange", name: "Orange Money", img: "/payments/orange-money.png", desc: "Réglez directement avec votre solde Orange Money.", tag: "Instantané" },
  { id: "card", name: "Visa / Mastercard", img: "/payments/visa-mastercard.webp", desc: "Carte bancaire internationale, débit sécurisé.", tag: "Paiement sécurisé" },
  // Masqué : le paiement se fait en ligne uniquement pour l'instant. Le cash
  // n'existe ni dans PayMethod ni dans l'enum SQL ; à réactiver avec sa logique
  // de confirmation dédiée si le paiement à la livraison est réintroduit.
  // { id: "cash", name: "Paiement en cash", img: "/payments/cash.jpg", desc: "Payez en espèces sur place, en toute simplicité.", tag: "À la livraison" },
];

// Stats de confiance affichées en bas de la section « À quoi ça sert » (icône · valeur forte · libellé)
const USAGE_STATS: [LucideIcon, string, string][] = [
  [Signal, "+1 milliard", "d'appareils dans le réseau"],
  [Lock, "Chiffré", "localisation de bout en bout"],
  // Valeur courte volontairement : les 4 stats sont alignées sur une seule
  // ligne, « Android & iPhone » passait à la ligne et décalait son libellé.
  [Smartphone, "Android · iOS", "Find Hub ou Localiser"],
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
// complète et détaillée vit dans la section « Comment ça marche »). On n'invente aucune promesse.
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

  // Arrivée depuis une autre page via /#how ou /#products : on cale sur la section
  // une fois le contenu monté (les sections « reveal » peuvent décaler la hauteur).
  React.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="z">
      {/* 01 — HERO (disposition conservée : texte gauche / produit droite)
          Fond radar/ondes animé (thème géolocalisation) posé derrière le contenu. */}
      <div className="wrap" style={{ position: "relative", overflow: "hidden", paddingTop: 46, paddingBottom: 40 }}>
        <HeroBackground />
        <div className="stack-sm" style={{ position: "relative", zIndex: 1, display: "flex", gap: 40, alignItems: "center" }}>
          <div className="reveal hero-col-text">
            {/* <div className="chip" style={{ marginBottom: 22 }}>
              <span className="pulse-dot" /> Réseaux Find Hub de Google & Localiser d&apos;Apple
            </div> */}
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
          <div className="reveal hero-col-media" style={{ display: "flex", justifyContent: "center", minWidth: 280, maxWidth: "100%" }}>
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

      {/* 04 — COMMENT ÇA MARCHE (route sinueuse en perspective, réf. model-principe).
          id="how" : cible d'ancre de la navbar « Comment ça marche ». */}
      <div id="how" className="wrap" style={{ scrollMarginTop: 96, paddingTop: 78, paddingBottom: 20 }}>
        <SectionHead center eyebrow="Le principe" title="Comment votre objet se fait retrouver" sub="Cinq temps, et une multitude de téléphones qui travaillent pour vous." />
        <PrincipleRoad />
        {/* Accès direct au guide de configuration pas à pas (hors tunnel d'achat). */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
          <Btn variant="ghost" onClick={() => go("guide")}><Settings2 size={18} /> Configurer ma carte</Btn>
        </div>
      </div>

      {/* 05 — NOS PACKS (2 options, une par produit — données uniquement, cf JOURNAL.md).
          id="products" : cible d'ancre de la navbar « Produits ». */}
      <div id="products" className="wrap" style={{ scrollMarginTop: 96, paddingTop: 78, paddingBottom: 20 }}>
        <SectionHead center eyebrow="Nos produits" title="Choisissez votre protection" />
        <PackOptions onOrder={(id) => order(id)} />
      </div>

      {/* 06 — CTA FINAL « Prêt à ne plus rien perdre » (modèle 2×2 : logos de paiement
          à la place des images, texte de réassurance, bouton de commande en bas) */}
      <div className="wrap" style={{ paddingTop: 78, paddingBottom: 24 }}>
        <SectionHead
          center
          eyebrow="Paiement facile"
          title="Prêt à ne plus rien perdre ?"
          sub="Commandez en quelques minutes et payez comme ça vous arrange — Mobile Money, carte ou cash."
        />
        <div className="pay-grid">
          {PAYMENTS.map((p, i) => (
            <div key={p.id} className={`pay-card reveal${i % 2 ? " rev" : ""}`}>
              <div className="pay-logo">
                <img src={p.img} alt={p.name} loading="lazy" />
              </div>
              <div className="pay-body">
                <h3 className="font-display">{p.name}</h3>
                <p>{p.desc}</p>
                <span className="pay-tag"><Check size={13} strokeWidth={3} /> {p.tag}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 38 }}>
          <Btn variant="primary" onClick={() => order()}>{CTA_LABEL} <ArrowRight size={18} /></Btn>
        </div>
      </div>

      {/* Modale de caractéristiques (ouverte au clic sur un visuel) */}
      <TagModal
        product={openTag}
        onClose={() => setOpenTag(null)}
        onOrder={() => { const id = openTag?.id; setOpenTag(null); order(id); }}
      />
    </div>
  );
}
