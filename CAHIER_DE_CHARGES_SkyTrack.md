# Cahier des charges — SkyTrack

**Site vitrine + tunnel d'achat & d'activation pour cartes de tracking (réseau Google Find My Device / Find Hub & Apple Localiser)**

Version 1.0 — Priorité : Front-end livrable et navigable, back-end en phase 2
Marché cible : Cameroun & Afrique francophone
Langue produit : Français (bilingue FR/EN en option phase 2)

---

## 1. Contexte & objectif

Google a ouvert en 2024 un réseau de géolocalisation participatif — **Find My Device**, aujourd'hui rebaptisé **Find Hub** — qui s'appuie sur plus d'un milliard de téléphones Android dans le monde pour remonter la position d'un objet équipé d'une petite balise Bluetooth. Sur iPhone, le même principe existe depuis longtemps avec le réseau **Localiser (Find My)** d'Apple. Ces balises existent en plusieurs formats ; le format **carte** (épaisseur d'une carte bancaire, se glisse dans un portefeuille) est le plus pertinent pour protéger portefeuille, papiers, passeport, sac ou bagage.

**SkyTrack** commercialise ces cartes de tracking. L'objectif de ce projet est un **site vitrine doublé d'un tunnel d'achat et d'activation** qui accompagne le visiteur de bout en bout :

1. Comprendre le service (onboarding pédagogique)
2. Comprendre concrètement comment fonctionne la carte
3. S'enregistrer (email **ou** numéro WhatsApp)
4. Payer (MTN MoMo, Orange Money **ou** carte Visa)
5. Apprendre à connecter la carte au téléphone (Android **ou** iOS, avec captures illustrées)
6. Télécharger la bonne application selon le système détecté (Android/Apple)

**Priorité de ce lot :** livrer un **front-end complet, navigable et responsive**, avec **toutes les redirections et transitions d'écran fonctionnelles** (données simulées côté client). Le back-end (paiement réel, comptes, base de données, notifications) est spécifié ici mais implémenté dans un second temps.

---

## 2. Cible & personas

| Persona | Profil | Besoin | Terminal |
|---|---|---|---|
| **Le distrait urbain** | 25–45 ans, actif, Douala/Yaoundé | Ne plus perdre portefeuille / clés / papiers | Android (majoritaire) |
| **Le voyageur** | Se déplace souvent, bagages/passeport | Suivre bagages et documents | Android / iPhone |
| **Le parent / la famille** | Foyer, plusieurs objets à protéger | Plusieurs cartes, partage de localisation | Android |
| **Le pro / commerçant** | Matériel, sacoches, sac de caisse | Suivi de plusieurs objets de valeur | Android / iPhone |

**Hypothèses marché :** parc majoritairement Android, bancarisation faible mais **pénétration mobile > 85 %** et **Mobile Money dominant** ; donc MoMo + Orange Money sont indispensables, la carte Visa est un complément pour clientèle aisée/internationale.

---

## 3. Périmètre fonctionnel (MVP)

### 3.1 Inclus dans le lot Front-end (ce lot)
- Site vitrine (accueil, fonctionnement, produits/tarifs, FAQ, support/contact)
- Onboarding pédagogique intégré
- Tunnel d'achat multi-étapes (wizard) avec barre de progression
- Formulaire d'enregistrement email **ou** WhatsApp (validation côté client)
- Écran de choix et de simulation de paiement (MoMo / OM / Visa) — **UI + états, sans transaction réelle**
- Écran de confirmation de commande
- Guide de configuration illustré, **conditionnel Android vs iOS**
- Détection automatique du système (User-Agent) + choix manuel
- Écran de téléchargement de l'application avec le bon bouton (Play Store / App Store)
- Responsive mobile-first, accessibilité de base, i18n prêt (textes centralisés)

### 3.2 Reporté au lot Back-end (phase 2)
- Intégration réelle de l'agrégateur de paiement + webhooks
- Comptes utilisateurs & authentification
- Base de données commandes / clients / cartes
- Notifications email + WhatsApp (confirmation, suivi livraison)
- Back-office admin (commandes, stock, statuts)
- Suivi de livraison
- Association carte ↔ client (numéro de série / QR)

---

## 4. Arborescence & navigation

```
Accueil (/)
├── Comment ça marche (/comment-ca-marche)
├── Produits & Tarifs (/produits)
├── FAQ (/faq)
├── Support / Contact (/support)
└── Commander → Tunnel (/commander)
      Étape 1 — Choix du pack
      Étape 2 — Enregistrement (email OU WhatsApp) + livraison
      Étape 3 — Paiement (MoMo / OM / Visa)
      Étape 4 — Confirmation de commande
      Étape 5 — Configuration (Android OU iOS, captures)
      Étape 6 — Téléchargement de l'app (selon OS)
```

**Règles de redirection clés :**
- Tout bouton « Commander » / « Acheter » / « Choisir ce pack » → entre dans le tunnel à l'étape 1 (ou 2 si le pack est déjà choisi).
- Le tunnel est **linéaire** avec possibilité de revenir en arrière ; on ne peut pas sauter une étape non complétée.
- À l'étape 3, le succès du paiement (simulé) redirige vers l'étape 4, l'échec reste sur l'étape 3 avec message d'erreur explicite.
- L'étape 5 s'adapte au système : soit détecté automatiquement, soit choisi par l'utilisateur (Android / iPhone).
- L'étape 6 affiche le bon store selon le même système.
- Le logo ramène toujours à l'accueil.

---

## 5. Spécifications par écran

### 5.1 Accueil
- **Hero** : accroche forte + sous-titre + double CTA (« Commander » / « Comment ça marche »). Élément signature : visualisation animée du **réseau** (la carte au centre, ondes de signal concentriques, téléphones Android autour qui « pingent » la position). C'est la traduction visuelle directe du fonctionnement du produit.
- **Barre de confiance** : réseau > 1 milliard d'appareils, données chiffrées de bout en bout, compatible Android & iPhone.
- **Bénéfices** (3–4 cartes) : portefeuille/papiers, clés, sac/bagage, partage familial.
- **Aperçu du fonctionnement** (teaser 3 étapes) → lien vers page dédiée.
- **Aperçu produits/tarifs** (3 packs) → lien vers page produits.
- **Bande FAQ / réassurance** (livraison, garantie, confidentialité).
- **CTA final** + footer.

### 5.2 Comment ça marche (fonctionnement détaillé de la carte)
Présenter **toutes les étapes de fonctionnement** de façon pédagogique :

1. **La carte émet un signal Bluetooth basse consommation** (BLE), discret et économe.
2. **Les téléphones Android à proximité** (réseau Find Hub) détectent ce signal de façon anonyme et chiffrée.
3. **La position remonte jusqu'à vous** dans l'application, sur une carte, même si l'objet est hors de votre portée.
4. **À proximité**, un indicateur « plus chaud / plus froid » et une sonnerie forte vous guident jusqu'à l'objet.
5. **Perte / partage** : marquez l'objet comme perdu, affichez un message au trouveur, partagez la localisation avec vos proches.

Points de vérité à afficher (issus du fonctionnement réel du réseau) :
- Fonctionne **mieux dans les zones fréquentées** (plus de téléphones = meilleure couverture) ; par défaut le réseau exige plusieurs appareils à proximité avant de remonter une position, pour la vie privée.
- Les **données de localisation sont chiffrées de bout en bout** ; ni Google ni SkyTrack n'y ont accès.
- La localisation peut être **partagée avec un nombre limité de personnes** et le partage est révocable à tout moment.
- Alertes anti-pistage inconnu (norme conjointe Google/Apple) : la carte ne peut pas servir à pister une personne à son insu.
- Une carte est liée à **un seul réseau à la fois** (Find Hub **ou** Localiser).

### 5.3 Produits & Tarifs
3 packs (prix indicatifs, à ajuster) :

| Pack | Contenu | Prix indicatif | Cible |
|---|---|---|---|
| **Solo** | 1 carte SkyTrack | 19 900 FCFA | Portefeuille / papiers |
| **Famille** | 3 cartes | 49 900 FCFA | Foyer, plusieurs objets |
| **Business** | 5 cartes | 79 900 FCFA | Pro / commerçant |

Chaque carte : autonomie longue durée / rechargeable, sonnerie, résistance aux éclaboussures, compatible Android (Find Hub) & iPhone (Localiser). CTA « Choisir ce pack » → tunnel.

### 5.4 Tunnel — Étape 1 : Choix du pack
Récapitulatif des 3 packs sous forme sélectionnable + résumé du panier. « Continuer » → étape 2.

### 5.5 Tunnel — Étape 2 : Enregistrement
- **Choix du moyen de contact** : bascule **Email** ⇄ **Numéro WhatsApp**.
- Champs communs : nom complet, ville, quartier / adresse de livraison.
- Validation côté client : format email ; format numéro (indicatif +237, longueur, chiffres).
- Message clair sur l'usage : « Nous utiliserons ce contact pour la confirmation de commande et le suivi de livraison. »
- « Continuer vers le paiement » → étape 3.

### 5.6 Tunnel — Étape 3 : Paiement
- **3 méthodes** : MTN MoMo, Orange Money, Carte Visa/Mastercard.
- **MoMo / OM** : saisie du numéro Mobile Money → écran « Confirmez sur votre téléphone » (simulation du push USSD/OTP) → succès/échec.
- **Visa** : formulaire carte (numéro, expiration, CVV, titulaire) → simulation 3-D Secure → succès/échec.
- **Sécurité (à afficher)** : « Vos informations de paiement ne transitent pas par nos serveurs » (vrai dès qu'on branche un agrégateur à page hébergée).
- Récapitulatif montant + pack à droite / en bas.
- Succès → étape 4. Échec → rester sur étape 3, message actionnable (« Solde insuffisant / transaction annulée — réessayez ou changez de moyen »).

### 5.7 Tunnel — Étape 4 : Confirmation
- Numéro de commande (généré côté client pour la démo).
- Récap : pack, montant, contact, livraison.
- Message : « Votre carte est en préparation. » + délai de livraison indicatif.
- CTA : « Configurer ma carte » → étape 5.

### 5.8 Tunnel — Étape 5 : Configuration (conditionnelle Android / iOS)
- **Détection auto** du système + boutons pour forcer **Android** ou **iPhone**.
- **Parcours Android (Find Hub)** — captures illustrées :
  1. Chargez / activez la carte (appui bouton).
  2. Le pop-up **Fast Pair** apparaît sur le téléphone → « Connecter ».
  3. Liez à votre compte Google, acceptez la charte d'usage responsable.
  4. La carte apparaît dans **Find Hub** ; installez l'app compagnon **SkyTrack** pour les fonctions bonus (sonnerie du téléphone, changer la sonnerie, etc.).
- **Parcours iPhone (Localiser)** — captures illustrées :
  1. Ouvrez **Localiser** → onglet **Objets**.
  2. **+** → **Ajouter un autre objet**, appuyez sur le bouton de la carte.
  3. La carte est détectée → **Connecter**.
  4. Nommez-la, choisissez un emoji, confirmez, **Terminer**.
- Note importante : une carte est liée à **un seul réseau à la fois** (choisir Android **ou** iPhone).
- CTA : « Télécharger l'application » → étape 6.

### 5.9 Tunnel — Étape 6 : Téléchargement
- Selon le système : bouton **Google Play** (Android) ou **App Store** (iPhone) mis en avant, l'autre en secondaire.
- Rappel : le **suivi** se fait dans **Find Hub** (Android) / **Localiser** (iPhone) ; l'app **SkyTrack** est une app **compagnon** (réglages + fonctions bonus).
- CTA secondaire : « Retour à l'accueil ».

### 5.10 FAQ
Questions à couvrir : couverture réseau au Cameroun, précision de la localisation, autonomie/recharge, compatibilité (Android 9+, iPhone), confidentialité des données, que faire en cas de perte, garantie, livraison, différence entre l'app SkyTrack et Find Hub/Localiser, une carte peut-elle suivre une personne (non — anti-pistage).

### 5.11 Support / Contact
Bloc contact WhatsApp (numéro cliquable `wa.me`), email, horaires, lien FAQ.

---

## 6. Module paiement — recommandations techniques (phase 2)

**Stratégie recommandée : un agrégateur unique** plutôt que l'intégration séparée de chaque opérateur, pour réunir MoMo + Orange Money + carte bancaire via une seule API et externaliser la sécurité (pages de paiement hébergées, les données sensibles ne touchent pas votre serveur).

Options adaptées au Cameroun (à arbitrer selon frais/support) :
- **CinetPay** — panafricain, MoMo + OM + Visa/Mastercard, lien de paiement, bonne couverture Afrique centrale/ouest.
- **Monetbil** — spécialisé sous-région, intégration simple, plugin WooCommerce, API REST documentée.
- **Fapshi**, **Notch Pay**, **AdwaPay** — acteurs locaux avec MoMo/OM/carte.
- **Intégration directe** MTN MoMo (Collections API) + Orange Money Web Payment : pertinente à fort volume sur un opérateur, mais KYC plus lourd et deux intégrations distinctes.

**Cycle de vie d'un encaissement** (à implémenter proprement côté back) :
1. **Initiation** : le serveur appelle l'API (montant, devise XAF, référence commande, URL de retour + URL de notification/webhook).
2. **Confirmation asynchrone** : la confirmation arrive rarement au moment prévu → s'appuyer sur le **webhook**, pas seulement sur le retour navigateur.
3. **Idempotence** : ne jamais encaisser deux fois la même commande (clé d'idempotence par référence).
4. **Vérification côté serveur** du montant/statut (ne jamais faire confiance au montant renvoyé par le navigateur).
5. **Réconciliation** en fin de période.

**Front (ce lot)** : le tunnel simule ces états (initiation → attente confirmation → succès/échec) pour que le branchement back soit un simple remplacement de la couche d'appel.

---

## 7. Spécifications techniques Front-end

- **Stack recommandé (prod)** : Next.js (App Router) + TypeScript + Tailwind. Le prototype livré est en React autonome (state-based routing) pour être immédiatement visible ; il se transpose en pages/routes Next.
- **Routing** : dans le prototype, routeur par état (`page` + état du tunnel). En prod : routes réelles + middleware pour protéger les étapes du tunnel.
- **Gestion d'état du tunnel** : objet centralisé (pack choisi, moyen de contact + valeur, moyen de paiement, système détecté, n° commande).
- **Détection OS** : parsing `navigator.userAgent` (Android / iOS / autre) + override manuel obligatoire (le parsing peut échouer).
- **Responsive** : mobile-first (la majorité du trafic est sur téléphone), breakpoints tablette/desktop.
- **Accessibilité** : focus visible au clavier, contrastes AA, `prefers-reduced-motion` respecté (couper les animations de signal), tailles de cible tactile ≥ 44 px.
- **i18n** : tous les textes centralisés dans un objet unique pour permettre l'ajout de l'anglais en phase 2.
- **Performance** : images optimisées, animations CSS légères, pas de dépendance lourde inutile.
- **Contenu** : voir §5, copie en français clair, orientée bénéfice utilisateur.

---

## 8. Aperçu Back-end (phase 2)

**Modèle de données (esquisse) :**
- `Client` (id, nom, contact_type [email|whatsapp], contact_value, ville, adresse, created_at)
- `Commande` (id, ref, client_id, pack, quantite, montant, devise, statut [initiee|payee|echouee|expediee|livree], moyen_paiement, created_at)
- `Paiement` (id, commande_id, agregateur, transaction_id, statut, montant_verifie, webhook_payload, created_at)
- `Carte` (id, numero_serie, commande_id, statut_activation, reseau [findhub|localiser])

**Services back :** endpoint d'initiation paiement, endpoint webhook (vérification signature + montant), envoi confirmation (email + WhatsApp Business API), back-office (liste commandes, stock, changement de statut, export).

**Exigences données personnelles :** minimisation des données collectées, consentement clair à l'usage du contact, base légale, conservation limitée, sécurisation des données de commande.

---

## 9. Exigences non-fonctionnelles

- **Sécurité paiement** : pages de paiement hébergées par l'agrégateur, vérification serveur, idempotence, webhooks signés.
- **Fiabilité** : gestion explicite des échecs de paiement et des confirmations asynchrones.
- **Performance** : chargement rapide sur connexion mobile moyenne.
- **Accessibilité** : conformité AA de base.
- **Confidentialité** : messages clairs sur l'usage des données et le chiffrement de la localisation.
- **Évolutivité** : architecture front prête à recevoir le back sans refonte.

---

## 10. Roadmap & priorisation

| Lot | Contenu | Statut |
|---|---|---|
| **Lot 1 — Front-end (priorité)** | Vitrine + tunnel complet navigable, redirections, responsive, données simulées | **À livrer maintenant** |
| **Lot 2 — Back paiement** | Agrégateur, webhooks, vérification, réconciliation | Phase 2 |
| **Lot 3 — Comptes & données** | Base de données, comptes, association carte↔client | Phase 2 |
| **Lot 4 — Notifications** | Email + WhatsApp Business, suivi livraison | Phase 2 |
| **Lot 5 — Back-office** | Admin commandes/stock/statuts, exports | Phase 2 |

---

## 11. Livrables du lot 1
- Front-end complet et navigable (vitrine + tunnel), responsive, en français.
- Toutes les redirections et transitions d'écran opérationnelles (données simulées).
- Textes intégrés, prêts à ajustement.
- Structure de composants transposable vers Next.js pour le branchement back.
