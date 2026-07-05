# Journal — SkyTrack

Suivi des décisions et des modifications différées (à traiter plus tard).

## À faire plus tard

### Refonte du modèle de commande : packs par produit + quantité
**Décidé le 2026-07-05.** La section « Choisissez votre protection » de la page d'accueil affiche désormais **2 options, une par produit** (Carte / Tag rond), définies **au niveau des données uniquement** (`PACK_OPTIONS` dans `src/lib/content.ts`, rendu par `src/components/PackOptions.tsx`).

Pour l'instant, **le modèle de commande et la base ne sont PAS touchés** :
- Le type `PackId` reste `solo | famille | business` (`src/lib/types.ts`), utilisé par le tunnel (`StepPack`, `Flow.pack`) et la table `commande`.
- Le bouton « Commander » des 2 options entre simplement dans le tunnel existant (`order()`), sans transmettre le produit ni la quantité choisis.
- Les **prix affichés sont des PLACEHOLDERS** (à confirmer une fois la stratégie de prix arrêtée).
- Le sélecteur de **quantité** est présentiel (non transmis à la commande).

**Reste à faire quand la stratégie de prix sera prête :**
1. Remplacer les prix placeholder dans `PACK_OPTIONS`.
2. Faire évoluer le modèle de commande pour porter le **produit** (carte / rond) et la **quantité** (aujourd'hui `PackId` ne code qu'un palier de quantité de cartes).
3. Migration BD `commande` en conséquence (colonnes produit + quantité).
4. Adapter le tunnel (`StepPack`, `Summary`, récap) et transmettre produit+quantité depuis `PackOptions`.
5. Décider du sort de la page `/produits` (affiche encore les 3 anciens packs) et du sélecteur `PackGrid` du tunnel.

### Tunnel encore « Android + iPhone »
Le site vitrine est passé en **Android uniquement** (2026-07-05), mais le tunnel de commande conserve pour l'instant le parcours iPhone : `StepSetup` (toggle OS + étapes iOS), `StepDownload`, `phones.tsx` (mockup iOS), détection iOS dans `commander/page.tsx`, type `OS` dans `types.ts`. À nettoyer plus tard si confirmé.
