J'ai tout ce qu'il me faut : la doc du hub, ton architecture de paiement actuelle (Lot 2), et le flux du tunnel. Bonne nouvelle d'entrée : ton code est déjà prêt à recevoir ce hub — l'interface PaymentProvider, la route webhook et la finalisation idempotente ont été conçues exactement pour ça. Voici mon analyse complète.

---
1. Ce que dit la doc, en résumé

Le hub (https://payment.edoctor-tim.com/api-v1) fonctionne en 3 temps :

1. Tu crées un paiement : POST /api-v1/paiement/ avec le header Authorization: HubToken <token> (pas Bearer !), un montant, un provider_id (1 = Orange Money, 2 = MTN MoMo, 3 = Carte/Cybersource), une reference unique de ton côté et le téléphone du client.
2. Le client valide sur son téléphone (mobile money) ou sur la page carte. Pendant ce temps, le statut est pending — c'est exactement ce que ton mock simule déjà.
3. Le hub te notifie du résultat via un webhook signé HMAC-SHA256 envoyé sur une URL de ton site, avec en secours un endpoint de polling (GET /paiement/payment-status/?reference=...) qui interroge le provider en temps réel.

La question « cronjob ou webhook ? » que t'a posée le dev back : la réponse est les deux, mais le webhook en canal principal. Le webhook est instantané et gratuit ; le polling sert uniquement de filet de sécurité quand un webhook se perd (réseau, déploiement, etc.). La doc elle-même le recommande (checklist, point « Fallback de polling »).

2. La stratégie que je recommande

Canal principal : le webhook (tu as déjà la route)

Ta route src/app/api/payments/webhook/route.ts existe déjà et appelle finalizePayment() qui est idempotente (un webhook rejoué sur une commande déjà finalisée est ignoré — exactement ce que demande la doc au point 6.8). Il manque deux choses :

- La vérification de signature HMAC (obligatoire) : lire le corps brut de la requête (request.text() avant tout JSON.parse), reconstruire {timestamp}.{body}, calculer le HMAC-SHA256 avec le webhook_secret, comparer en temps constant, et rejeter si le timestamp a plus de 5 minutes (anti-rejeu). L'exemple Node de la doc se transpose directement en route handler Next.
- Un adapter hub.ts dans src/lib/payments/ qui implémente ton interface PaymentProvider : c'est le seul vrai fichier nouveau. Son parseWebhook traduira le payload du hub (data.reference, data.status) vers ton format normalisé. Ensuite PAYMENT_PROVIDER=hub dans .env.local et tout le reste (base, statuts, notifications, tunnel) fonctionne sans modification — c'est le design qu'on avait prévu.

Filet de sécurité : polling intégré, pas de cronjob séparé

Ton tunnel polle déjà getOrderStatus() pendant l'attente de confirmation. Je propose d'enrichir ce sondage : si la commande est encore initiee avec un paiement pending depuis plus de ~30–60 secondes, le serveur interroge en plus GET /paiement/payment-status/ du hub et finalise si le statut a changé. Avantages :

- Pas d'infrastructure cron à mettre en place, ni de process qui tourne en permanence.
- Le client qui attend sur la page de confirmation est couvert même si le webhook n'arrive jamais.
- Un cron Vercel quotidien pourra s'ajouter plus tard pour rattraper les commandes abandonnées (le client ferme l'onglet avant confirmation), mais ce n'est pas bloquant pour démarrer.

Correspondance des moyens de paiement

Ton type PayMethod (om / momo / visa) se mappe directement : om → provider_id "1", momo → "2", visa → "3".

⚠️ Incohérence à clarifier avec le dev back : dans son exemple curl il envoie provider_id: "2" mais la réponse montre provider.name: "OM". Sa liste dit 1 = OM, 2 = MOMO, 3 = Carte, et la doc confirme — mais il faut valider ce mapping sur l'environnement déployé avant la prod, sinon on débite Orange en croyant débiter MTN.

Le cas particulier de la carte (Cybersource)

Pour OM et MoMo, le flux est simple : initiation → le client tape son code PIN → webhook. Pour la carte, la doc dit que le hub renvoie une page HTML auto-soumise à afficher dans une iframe ou via un POST de formulaire — ce n'est pas une simple URL de redirection comme ton interface le prévoit (redirectUrl). C'est faisable (tu l'avais déjà fait aboutir sur le vieux projet Materio), mais ça demande un travail frontend spécifique dans le tunnel.

Ma recommandation : phaser. Phase 1 = OM + MoMo (l'essentiel de tes clients au Cameroun, flux identique au mock actuel, zéro changement d'UI). Phase 2 = carte Visa/Mastercard, avec l'expérience du vieux projet comme référence.

Points de vigilance techniques

- Unicité de la reference : le hub retrouve un paiement par la référence que TU envoies, et c'est elle qui revient dans le webhook. Or si un client échoue (solde insuffisant, comme dans l'exemple 60019) puis réessaie, la même commande génère un 2ᵉ paiement. Il faut donc une référence par tentative (ex. SKY-ABC123-T2), pas par commande. Ta table paiements gère déjà ça via transaction_id — on y stockera cette référence.
- Format téléphone : le hub exige 2376XXXXXXXX. Il faudra normaliser la saisie client (ajouter le préfixe 237 si absent, retirer espaces et +).
- Vérification du montant : le webhook renvoie amount — finalizePayment le stocke déjà dans montant_verifie ; on ajoutera une alerte si le montant confirmé diffère du montant de la commande.
- Statut cancelled : la doc liste 4 statuts (pending, success, failed, cancelled) ; cancelled sera traité comme un échec côté commande.
- Toujours vérifier status dans la réponse d'initiation (comme il l'a insisté) : l'exemple « solde insuffisant » montre qu'un échec peut arriver dès l'initiation — le payload contient status: "FAILED" immédiatement, pas de webhook à attendre.

3. Les ressources nécessaires (ce qu'il faut obtenir et de qui)

Auprès de Timothé / l'admin du hub — bloquant, à demander en premier :

1.  et e pour SkyTrack (section 2.1 de la doc), créé avec can_create_payment: true, can_check_status: true, webhook_enabled: true et webhook_url pointant vers https://<ton-domaine-prod>/api/payments/webhook. En retour tu reçois deux secrets à conserver : le token (hub_...) et le webhook_secret (whsec_...).
2. Le déploiement du hub à jour (c'était déjà dans tes notes — les mises à jour qu'il a faites doivent être en ligne sur payment.edoctor-tim.com).
3. Confirmation du mapping provider_id (le point d'incohérence ci-dessus) et de l'URL exacte : son curl utilise /api/payments/ en local, la doc dit /api-v1/paiement/ en prod — il faut trancher.

Côté SkyTrack (nous) :

4. Trois variables d'environnement : EDOCTOR_HUB_URL, EDOCTOR_HUB_TOKEN, EDOCTOR_HUB_WEBHOOK_SECRET, plus le basculement PAYMENT_PROVIDER=hub. Le mock reste disponible en un changement de variable — précieux pour continuer à développer sans faire de vrais débits.
5. Une URL publique HTTPS pour recevoir les webhooks. En prod c'est ton déploiement normal. En dev local, localhost n'est pas joignable par le hub — deux options : tester avec un tunnel type ngrok/cloudflared, ou s'appuyer sur le polling de secours (qui, lui, marche depuis localhost puisque c'est nous qui appelons le hub). C'est d'ailleurs un argument de plus pour le polling intégré.
6. Du crédit de test : les paiements seront réels (vrais débits OM/MoMo). Prévoir un petit montant sur un numéro de test pour valider le bout-en-bout, et idéalement un test « solde insuffisant » pour vérifier le chemin d'échec.

Travail de code (estimation) :

┌────────────────────────────────────────────────────────────┬─────────────────────────────────────────────┐
│                           Tâche                            │                   Ampleur                   │
├────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ Adapter hub.ts (initiation + parse webhook)                │ Le morceau principal, bien cadré par la doc │
├────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ Signature HMAC + anti-rejeu sur la route webhook           │ Petit, exemple fourni dans la doc           │
├────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ Références uniques par tentative + normalisation téléphone │ Petit                                       │
├────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ Polling de secours dans getOrderStatus                     │ Petit                                       │
├────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ Carte Cybersource (iframe/form POST)                       │ Phase 2, plus conséquent                    │
└────────────────────────────────────────────────────────────┴─────────────────────────────────────────────┘

Rien à changer dans le tunnel UI, la base ou les notifications pour la phase 1 : le cycle pending → webhook → payee/echouee est déjà celui du mock.

---
En résumé : webhook signé en canal principal (ta route existe, il manque la signature), polling du hub en filet de sécurité greffé sur le sondage existant (pas de cron à installer), un seul nouveau fichier hub.ts grâce à l'architecture d'adapters, démarrage OM + MoMo puis carte en phase 2. Le seul vrai bloquant aujourd'hui est le ServiceToken à demander à Timothé avec le déploiement du hub à jour.
