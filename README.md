# SkyTrack — Site vitrine & tunnel d'achat/activation

Application **Next.js (App Router) + TypeScript** issue du prototype `SkyTrack.jsx`.
Elle couvre le **Lot 1 — Front-end** du cahier des charges : vitrine complète,
navigable et responsive, avec **toutes les redirections et transitions d'écran
fonctionnelles** (données simulées côté client). Le back-end (paiement réel,
comptes, notifications) est le **Lot 2**.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm run start    # sert le build de production
npm run lint     # ESLint (next/core-web-vitals)
```

## Routes

| Chemin | Écran |
|---|---|
| `/` | Accueil (hero radar animé, bénéfices, teasers, CTA) |
| `/comment-ca-marche` | Fonctionnement détaillé + points de vérité |
| `/produits` | Packs & tarifs (Solo / Famille / Business) |
| `/faq` | Questions fréquentes (accordéon) |
| `/support` | Contact WhatsApp / email / horaires |
| `/commander` | Tunnel d'achat en 6 étapes (wizard) |
| `/commander?pack=<id>` | Tunnel démarré à l'étape « Compte », pack pré-sélectionné |

Le tunnel est linéaire avec retour arrière. `?pack=solo\|famille\|business`
pré-remplit le pack (déclenché par « Choisir ce pack »).

## Structure

```
src/
├─ app/
│  ├─ layout.tsx              # <html> + habillage global (SiteChrome)
│  ├─ globals.css             # design system (variables, cartes, radar, phone…)
│  ├─ page.tsx                # Accueil
│  ├─ comment-ca-marche/…     # Fonctionnement
│  ├─ produits/…              # Produits & tarifs
│  ├─ faq/…                   # FAQ
│  ├─ support/…               # Support
│  └─ commander/page.tsx      # Conteneur du tunnel (état pack/step/OS)
├─ components/
│  ├─ ui.tsx                  # Logo, Btn, SectionHead, Radar
│  ├─ PackGrid.tsx            # Grille de packs sélectionnable
│  ├─ Nav.tsx / Footer.tsx / SiteChrome.tsx
│  └─ tunnel/                 # Stepper, Summary, StepPack…StepDownload, phones
└─ lib/
   ├─ types.ts                # Flow, Pack, OS, PayMethod…
   ├─ content.ts              # Contenus centralisés (i18n-ready) + fcfa()
   ├─ nav.ts                  # Mapping clé de page ↔ chemin
   └─ useNav.ts               # Hook go()/order() câblé sur le routeur Next
```

## Gestion d'état du tunnel

L'objet `Flow` (`src/lib/types.ts`) centralise pack, contact, livraison, moyen
de paiement, OS détecté et n° de commande — comme spécifié au §7 du cahier.
La détection d'OS lit `navigator.userAgent` avec override manuel.

## Points de branchement Lot 2 (back-end)

Le front simule le cycle de vie du paiement (`initiation → attente → succès/échec`)
dans `src/components/tunnel/StepPay.tsx`. Le branchement d'un agrégateur
(CinetPay / Monetbil / Fapshi…) consiste à remplacer la fonction `pay()` par un
appel d'initiation serveur, puis à confirmer via webhook. Le n° de commande est
généré côté client (`StepConfirm`) en attendant la persistance serveur.

## Contenu

Tous les textes sont regroupés dans `src/lib/content.ts` pour préparer
l'ajout de l'anglais (i18n) en phase 2.

🔌 Pour brancher votre hub plus tard (aucun autre changement en aval)

1. Créez src/lib/payments/<hub>.ts implémentant PaymentProvider, enregistrez-le dans index.ts.
2. PAYMENT_PROVIDER=<hub> dans .env.local.
3. Pointez le callback du hub sur /api/payments/webhook et ajoutez-y la vérification de signature (commentaire ⚠️ Sécurité déjà en place). finalizePayment (idempotent) est partagé avec le mock → le reste ne bouge pas.
