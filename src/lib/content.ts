import {
  Wallet, FileText, Briefcase, Users, Radio, Signal, MapPin, Volume2, Share2,
  Lock, Shield, Nfc, Battery, Droplets, Ruler, Smartphone, CreditCard,
} from "lucide-react";
import type { Pack, IconItem, Step, FaqItem, TagProduct } from "./types";

export const PACKS: Pack[] = [
  { id: "solo", name: "Solo", cards: 1, price: 19900, tag: "Le plus populaire",
    desc: "Pour ne plus jamais perdre votre portefeuille et vos papiers.", best: true },
  { id: "famille", name: "Famille", cards: 3, price: 49900, tag: "Économisez 9 700 F",
    desc: "Protégez portefeuille, sac et bagage de tout le foyer.", best: false },
  { id: "business", name: "Business", cards: 5, price: 79900, tag: "Meilleur prix / carte",
    desc: "Sacoches, matériel, sac de caisse — gardez tout à l'œil.", best: false },
];

export const fcfa = (n: number): string =>
  n.toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA";

export const BENEFITS: IconItem[] = [
  { icon: Wallet, t: "Portefeuille & CNI", d: "Glissez la carte entre vos cartes bancaires. Retrouvez votre portefeuille en un instant." },
  { icon: FileText, t: "Passeport & documents", d: "Dans la pochette de voyage, elle veille sur vos papiers les plus précieux." },
  { icon: Briefcase, t: "Sac, sacoche & bagage", d: "À l'aéroport, en taxi, au bureau — sachez toujours où est votre sac." },
  { icon: Users, t: "Partage en famille", d: "Partagez la localisation d'un objet avec vos proches, révocable à tout moment." },
];

// Fiches produit ouvertes dans la modale depuis la section « À quoi ça sert ».
// Tag rond : specs réelles (fiche fabricant TDTOD). Carte : specs techniques
// chiffrées encore à confirmer — on n'affiche que des faits établis.
export const TAG_PRODUCTS: TagProduct[] = [
  {
    id: "rond",
    name: "Tag rond",
    tagline: "Le porte-clés connecté pour clés, sac et bagage.",
    image: "/tag-rond.png",
    usage: "Clés, sac à dos, valise, sacoche",
    highlights: [
      "S'ajoute au réseau Google Find Hub sans application tierce",
      "Sonnerie intégrée pour le retrouver une fois à proximité",
      "Pile remplaçable soi-même en quelques secondes",
    ],
    specs: [
      { icon: Signal, label: "Réseau", value: "Google Find Hub (Localiser)" },
      { icon: Nfc, label: "Connectivité", value: "Bluetooth" },
      { icon: Battery, label: "Autonomie", value: "≈ 12 mois · pile CR2032 remplaçable" },
      { icon: Droplets, label: "Résistance", value: "IP66 · eau & poussière" },
      { icon: Radio, label: "Portée Bluetooth", value: "jusqu'à ~100 m en champ libre" },
      { icon: Volume2, label: "Sonnerie", value: "Haut-parleur intégré" },
      { icon: Smartphone, label: "Compatibilité", value: "Android 9+ uniquement" },
      { icon: Ruler, label: "Format", value: "Rond & plat · trou pour porte-clés" },
    ],
  },
  {
    id: "carte",
    name: "Carte",
    tagline: "Fine comme une carte bancaire, elle veille sur votre portefeuille.",
    image: "/tag-carte.jpeg",
    usage: "Portefeuille, CNI, passeport, bagages",
    highlights: [
      "Ultra-fine (1,8 mm) : se glisse dans le portefeuille sans le faire gonfler",
      "Rechargeable sans fil : 3 à 6 mois d'autonomie, plus de pile à changer",
      "Partage familial : suivi simultané par 2 téléphones",
    ],
    specs: [
      { icon: Signal, label: "Réseau", value: "Google Find Hub (Localiser)" },
      { icon: Nfc, label: "Connectivité", value: "Bluetooth" },
      { icon: Battery, label: "Autonomie", value: "3 à 6 mois · recharge sans fil (Qi)" },
      { icon: Droplets, label: "Résistance", value: "IP68 · étanche & anti-poussière" },
      { icon: Radio, label: "Portée Bluetooth", value: "jusqu'à ~50 m en champ libre" },
      { icon: Volume2, label: "Sonnerie", value: "Bip jusqu'à 90 dB" },
      { icon: Smartphone, label: "Compatibilité", value: "Android 9+ uniquement" },
      { icon: CreditCard, label: "Épaisseur", value: "1,8 mm · format carte bancaire" },
    ],
  },
];

// Options d'achat de la page d'accueil = 1 par produit (Carte / Tag rond).
// PRIX = PLACEHOLDER à confirmer. Le modèle de commande (PackId) et la BD restent
// inchangés : « Commander » entre dans le tunnel existant. Voir JOURNAL.md.
export const PACK_OPTIONS: { productId: TagProduct["id"]; price: number; best?: boolean }[] = [
  { productId: "carte", price: 19900, best: true },
  { productId: "rond", price: 14900 },
];

export const STEPS_FUNC: Step[] = [
  { n: "01", icon: Radio, t: "La carte émet un signal", d: "Un signal Bluetooth basse consommation, discret et économe en batterie, se diffuse en continu autour de la carte." },
  { n: "02", icon: Signal, t: "Le réseau la détecte", d: "Les téléphones Android à proximité (réseau Find Hub de Google) captent ce signal de façon anonyme et chiffrée." },
  { n: "03", icon: MapPin, t: "La position remonte vers vous", d: "Vous voyez la dernière position de l'objet sur une carte, dans l'application — même s'il est hors de votre portée." },
  { n: "04", icon: Volume2, t: "À proximité, on vous guide", d: "Un indicateur « plus chaud / plus froid » et une sonnerie forte vous mènent jusqu'à l'objet." },
  { n: "05", icon: Share2, t: "Perte & partage", d: "Marquez l'objet comme perdu, affichez un message au trouveur, ou partagez sa position avec un proche." },
];

export const TRUTHS: IconItem[] = [
  { icon: Signal, t: "Meilleure couverture en zone fréquentée", d: "Plus il y a de téléphones autour, meilleure est la localisation. Par défaut, le réseau attend plusieurs appareils avant de remonter une position, pour protéger la vie privée." },
  { icon: Lock, t: "Localisation chiffrée de bout en bout", d: "Vos données de position sont chiffrées. Ni Google ni SkyTrack n'y ont accès — vous seul, et les personnes que vous choisissez." },
  { icon: Shield, t: "Protection anti-pistage", d: "Une norme anti-pistage commune à l'industrie alerte toute personne qui aurait une carte inconnue près d'elle. Impossible de suivre quelqu'un à son insu." },
  { icon: Smartphone, t: "Pensée pour Android", d: "La carte se connecte au réseau Google Find Hub (Android 9 ou plus récent). Compatible Android uniquement — ni iPhone (iOS) ni Huawei (HarmonyOS)." },
];

export const FAQS: FaqItem[] = [
  { q: "La carte fonctionne-t-elle bien au Cameroun ?", a: "Oui. Le réseau s'appuie sur les téléphones Android autour de la carte, et Android est très répandu au Cameroun. La localisation est d'autant plus précise dans les zones fréquentées (marchés, quartiers, axes passants)." },
  { q: "Quelle est la précision de la localisation ?", a: "Vous obtenez la dernière position connue de l'objet dès qu'un téléphone du réseau passe à proximité. Tout près, l'indicateur de distance et la sonnerie vous guident jusqu'à l'objet exact." },
  { q: "Quelle autonomie ? Faut-il recharger ?", a: "La carte est conçue pour une longue autonomie. Selon le modèle, elle est rechargeable — un voyant vous prévient quand il faut la recharger." },
  { q: "Avec quels téléphones est-elle compatible ?", a: "Android 9 ou plus récent, via l'application Google Find Hub (« Localiser mon appareil »). Les cartes SkyTrack sont compatibles Android uniquement — elles ne fonctionnent pas avec iPhone (iOS) ni Huawei (HarmonyOS)." },
  { q: "Mes données sont-elles privées ?", a: "Oui. La localisation est chiffrée de bout en bout. Personne d'autre que vous — et les proches avec qui vous partagez — ne peut voir où se trouve votre objet." },
  { q: "Quelle différence entre l'app SkyTrack et Google Find Hub ?", a: "Le suivi se fait dans l'application Google Find Hub (« Localiser mon appareil ») sur Android. L'app SkyTrack est une app compagnon : elle sert à l'installation et ajoute des fonctions bonus (faire sonner votre téléphone, changer la sonnerie de la carte, etc.)." },
  { q: "Peut-on l'utiliser pour suivre une personne ?", a: "Non. Le système alerte automatiquement toute personne près de qui se trouverait une carte inconnue. SkyTrack sert à retrouver vos objets, pas à pister quelqu'un." },
  { q: "Comment se passe la livraison ?", a: "Après votre commande, nous préparons votre carte et vous contactons (WhatsApp ou email) pour la livraison. Le délai indicatif vous est communiqué à la confirmation." },
];
