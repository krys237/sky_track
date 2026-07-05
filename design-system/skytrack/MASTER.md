# Design System: SkyTrack (Global Source of Truth)

> Généré via le skill `ui-ux-pro-max`, curé manuellement pour ce projet. Toute page peut créer un override dans `pages/[page].md` — sinon ce fichier fait foi.

## Brief (rappel)
- Ton : **rassurant / familial**, grand public (pas B2B, pas kids)
- Mode : **clair / éditorial primaire** (pivot du 2026-07-05). L'ancienne direction dark rendait « générique / dark-tech » — l'exact reproche fait à l'ancien design. On vise l'aéré premium des références (Bloom `model-2`, Payze `model-3`) : fond clair chaud, whitespace, vraie photo produit.
- À conserver : contenu texte, hero **texte à gauche / visuel produit à droite**, la typo Plus Jakarta Sans, la triade fonctionnelle bleu/vert/ambre (mais en **accents** sur canvas clair, plus en bain sombre).
- Hero : le **visuel photoréaliste** (`public/hero-scene.jpg`, recadré depuis `capture/hero-page.png` — carte + tag flottants sur un plan, ondes, épingle, app Find Hub). Remplace l'ancien `Radar` CSS plat. Naturellement clair, il colle au mode éditorial.
- À bannir : le dark navy plein écran, les surfaces translucides sombres, l'ancien teal `#2FE6C4`.

## Design Dials
- **Variance (audace layout) :** 4/10 — Balanced / Modern. Pas de layout expérimental, mais pas générique non plus.
- **Motion (intensité animation) :** 6/10 — Standard. Scroll reveals partout, parallax léger sur le hero, stagger sur les listes/cards. Pas de motion décorative gratuite.
- **Density (densité visuelle) :** 5/10 — Standard. Les infos existent déjà (cahier des charges) : on illustre/aère, on ne condense pas plus.

## Pattern de page — Landing (Real-Time / Operations, adapté grand public)
Choisi car c'est un produit IoT de tracking (Find Hub) : le pattern "Real-Time / Operations" (hero produit + statut live → indicateurs clés → comment ça marche → CTA) colle mieux qu'un pattern SaaS générique.

1. **Hero** — produit (tags) + aperçu app "en direct" (statut localisé/connecté)
2. **Indicateurs de confiance** — stats simples (ex. autonomie batterie, précision, portée, garantie) — *pas* de jargon corporate, du concret rassurant
3. **Comment ça marche** — 3-4 étapes illustrées
4. **Preuve sociale / réassurance** — avis, garantie, SAV
5. **CTA final**

## Style — synthèse
- Base : **clair éditorial chaleureux**. Fond blanc cassé légèrement bleuté (`--bg #F4F8FC`), sections alternées en bleu très pâle (`--bg-alt #E9F1F9`), surfaces cartes en blanc pur. L'aéré et le premium viennent du **whitespace + photo produit**, pas d'effets. Encre = navy profond (`--text #0E1E33`) pour garder l'héritage « ciel/nuit ».
- Éléments "Trust & Authority" adaptés : badges de garantie, mentions concrètes (ex. "Garantie 2 ans", "Support FR"), présentés simplement, sans logos corporate froids.
- Éléments "Soft UI" : coins arrondis, ombres douces multi-couches, jamais de brutalism/flat dur.
- Cartes produit avec photo détourée + halo doux (cf. `cart monde circulaire`, `tag carte`, `tag rond` existants — on garde ces assets et leur traitement).
- Accessibilité : contraste texte 4.5:1 mini même en dark, focus visibles, `prefers-reduced-motion` respecté.

## Couleurs (clair éditorial primaire) — source : `src/app/globals.css`

| Rôle | Hex | Variable CSS | Usage |
|---|---|---|---|
| Background (base) | `#F4F8FC` | `--bg` | Fond de page, blanc cassé bleuté chaud |
| Background (alt) | `#E9F1F9` | `--bg-alt` | Sections alternées, bandeaux, seg tracks |
| Surface / Card | `#FFFFFF` | `--card` | Cartes, panneaux |
| Surface 2 | `#F7FAFD` | `--surface-2` | Boutons ghost, placeholders |
| Border | `rgba(16,42,73,.10)` / `.16` | `--line` / `--line-strong` | Séparateurs, contours cartes |
| Foreground (texte) | `#0E1E33` | `--text` | Texte principal (encre navy) |
| Muted (texte secondaire) | `#55708A` | `--muted` | Sous-titres, descriptions |
| Muted 2 (texte tertiaire) | `#8496A9` | `--muted2` | Légendes, placeholders |
| **Primary** — confiance | `#2563EB` | `--primary` | Liens, focus, boutons app (contraste sur blanc) |
| Primary bright | `#3B82F6` | `--primary-bright` | Aplats/glows décoratifs |
| **Secondary** — réassurance | `#059669` | `--signal` | Texte/icônes vert, statut « localisé » (contraste sur blanc) |
| Secondary bright | `#10B981` | `--signal-bright` | Aplats de statut, pulse « en ligne » |
| **Accent / CTA** — chaleur | `#F59E0B` | `--accent` | Boutons principaux, prix, highlights |
| Accent ink (texte/bord) | `#B45309` | `--amber-ink` | Ambre en TEXTE ou bordure sur clair (contraste) |
| On Accent | `#231404` | — | Texte sur fond ambre |
| Destructive | `#EF4444` | `--destructive` | Erreurs, alertes |
| Ring (focus) | `#2563EB` | `--ring` | Anneaux de focus clavier |

**Logique** : bleu = fiabilité technologique, vert = signal positif ("votre objet est là"), ambre = chaleur humaine et appel à l'action. Sur canvas clair, deux teintes par accent : la **vive** (`-bright`) pour les aplats/statuts, la **profonde** (base / `-ink`) dès que la couleur devient du texte, une bordure ou une icône — pour tenir le contraste 4.5:1. Alias legacy `--night/--slate` → pointent vers les tokens clairs (compat).

## Typographie — Friendly SaaS

- **Famille unique :** Plus Jakarta Sans (titres + corps, plusieurs graisses)
- **Échelle de graisses :**
  - 800 (ExtraBold) — Hero / titres H1, line-height 1.1–1.2
  - 700 (Bold) — H2/H3 sections
  - 600 (SemiBold) — titres de cartes, boutons
  - 400/500 (Regular/Medium) — corps de texte, line-height 1.5
- **Import :**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
```
- **Tailwind/CSS var :** `--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;`
- Un mono discret peut subsister pour les micro-labels techniques (ex. specs produit) : `JetBrains Mono` en petites capitales, usage très parcimonieux (pas dans les titres).

## Motion — direction (niveau 6/10)

- **Hero :** parallax léger sur les visuels produit/ondes (yPercent 5–15, scrub, `ease: none`) — jamais sur le texte.
- **Scroll reveal standard** sur toutes les sections sous la ligne de flottaison : `opacity 0→1, y 12px→0, duration 300-400ms, power1.out`, trigger `top 90%`.
- **Stagger** sur les listes/grilles de cartes (produits, étapes "comment ça marche") : `stagger 0.06-0.1s, expo.out`.
- **Micro-interactions :** boutons/cards `scale 0.97→1` au press, transitions hover 150-300ms.
- Toujours respecter `prefers-reduced-motion` (désactiver parallax + stagger, garder un simple fade).
- Le code existant d'animation des visuels produits (halo/float) et des ondes est **conservé et réutilisé** dans le nouveau système — ne pas le réécrire from scratch.

## Pré-livraison (checklist)
- [ ] Contraste texte ≥ 4.5:1 sur fond dark
- [ ] Focus visibles clavier (ring `--ring`)
- [ ] `prefers-reduced-motion` respecté
- [ ] Aucune icône emoji (SVG uniquement : Lucide, déjà utilisé dans le projet)
- [ ] Responsive : 375px / 768px / 1024px / 1440px
- [ ] Hero : texte à gauche, visuel produit à droite (conservé)
- [ ] Assets `cart monde circulaire`, `tag carte`, `tag rond` réintégrés avec leur animation existante
